import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { Content, ContentSchedule, Screen } from '../types';
import { supabase } from '../lib/supabase';
import gsap from 'gsap';
import Hls from 'hls.js';
import MessageBanner from '../components/MessageBanner';

const SLIDE_DURATION = 15000; // 15 seconds per slide
const FETCH_INTERVAL = 60000; // Fetch every minute
const MIN_FETCH_INTERVAL = 5000; // Minimum time between fetches
const PAGE_SIZE = 6; // Number of items to show per page in full text view

// Helper function to determine actual media type based on URL
const getActualMediaType = (url: string, contentType: string): 'image' | 'video' => {
  if (!url) return contentType as 'image' | 'video';
  
  const urlLower = url.toLowerCase();
  
  // Check for video extensions
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.m3u8'];
  const isVideoUrl = videoExtensions.some(ext => urlLower.includes(ext));
  
  // Check for image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const isImageUrl = imageExtensions.some(ext => urlLower.includes(ext));
  
  if (isVideoUrl) return 'video';
  if (isImageUrl) return 'image';
  
  // Fallback to content type if URL doesn't have clear extension
  return contentType as 'image' | 'video';
};

const Preview: React.FC = () => {
  const { screenId, shortUrl } = useParams<{ screenId?: string; shortUrl?: string }>();
  const [screen, setScreen] = useState<Screen | null>(null);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [schedules, setSchedules] = useState<(ContentSchedule & { content: Content })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const timeoutRef = useRef<number>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastFetchRef = useRef<number>(0);
  const activeSchedulesRef = useRef<(ContentSchedule & { content: Content })[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);

  const categoryTitles: Record<string, string> = {
    breakfast: 'Desayunos',
    lunch: 'Almuerzos',
    dinner: 'Cenas',
    snacks: 'Extras',
    hot_drinks: 'Bebidas Calientes',
    cold_drinks: 'Bebidas Frías',
    frappes: 'Frappés',
    others: 'Otros',
    promotion: 'Promociones'
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const animateContent = useCallback(() => {
    if (!contentRef.current || !menuRef.current) return;

    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(menuRef.current.children,
      { opacity: 0, x: 50 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.8, 
        stagger: 0.1,
        ease: "power3.out"
      }
    );
  }, []);

  const checkOverflow = useCallback(() => {
    if (!gridRef.current || screen?.layout_type !== 'full_text') return false;
    return gridRef.current.scrollHeight > gridRef.current.clientHeight;
  }, [screen?.layout_type]);

  const rotatePage = useCallback(() => {
    if (!checkOverflow()) return;

    const categorySchedules = schedules.filter(s => 
      s.content.category === currentContent?.category
    );

    const totalPages = Math.ceil(categorySchedules.length / PAGE_SIZE);
    const nextPage = (currentPage + 1) % totalPages;

    gsap.to(menuRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.5,
      onComplete: () => {
        setCurrentPage(nextPage);
        gsap.fromTo(menuRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 }
        );
      }
    });
  }, [currentPage, schedules, currentContent?.category, checkOverflow]);

  const fetchData = useCallback(async () => {
    try {
      // Validate that we have either screenId or shortUrl
      if ((!screenId || screenId === 'undefined') && (!shortUrl || shortUrl === 'undefined')) {
        setError('ID de pantalla no proporcionado');
        return;
      }

      const now = Date.now();
      if (now - lastFetchRef.current < MIN_FETCH_INTERVAL) {
        return;
      }
      lastFetchRef.current = now;

      let screenData;
      let screenError;

      // Query by screenId if available and valid
      if (screenId && screenId !== 'undefined') {
        const { data, error } = await supabase
          .from('screens')
          .select(`
            *,
            locations (
              id,
              name,
              address
            )
          `)
          .eq('id', screenId)
          .single();
        
        screenData = data;
        screenError = error;
      }
      // Query by shortUrl if screenId is not available
      else if (shortUrl && shortUrl !== 'undefined') {
        const { data, error } = await supabase
          .from('screens')
          .select(`
            *,
            locations (
              id,
              name,
              address
            )
          `)
          .eq('short_url', shortUrl)
          .single();
        
        screenData = data;
        screenError = error;
      }

      if (screenError) throw screenError;
      if (!screenData) {
        setError('Pantalla no encontrada');
        return;
      }

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('content_schedule')
        .select(`
          *,
          content (
            *,
            sizes:content_sizes (
              *,
              size:sizes (*)
            )
          )
        `)
        .eq('screen_id', screenData.id)
        .eq('is_active', true);

      if (scheduleError) throw scheduleError;
      const validSchedules = scheduleData.filter(schedule => schedule.content);

      setScreen(screenData);
      setSchedules(validSchedules);
      setError(null);
    } catch (err) {
      console.error('Error al cargar la programación:', err);
      setError('Error al cargar la programación');
    }
  }, [screenId, shortUrl]);

  const updateActiveContents = useCallback(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 8);

    console.log('Updating active contents:', {
      currentDay,
      currentTime,
      totalSchedules: schedules.length
    });
    const validSchedules = schedules.filter(schedule =>
      schedule.days_of_week.includes(currentDay) &&
      schedule.start_time <= currentTime &&
      schedule.end_time > currentTime
    );

    console.log('Valid schedules found:', validSchedules.length);
    if (validSchedules.length !== activeSchedulesRef.current.length || 
        JSON.stringify(validSchedules.map(s => s.id)) !== JSON.stringify(activeSchedulesRef.current.map(s => s.id))) {
      activeSchedulesRef.current = validSchedules;
      setCurrentScheduleIndex(0);

      if (validSchedules.length > 0) {
        console.log('Setting current content:', validSchedules[0].content.title);
        setCurrentContent(validSchedules[0].content);
      } else {
        console.log('No valid schedules, clearing current content');
        setCurrentContent(null);
      }
    }

    return validSchedules;
  }, [schedules]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, FETCH_INTERVAL);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fetchData]);

  useEffect(() => {
    // Cleanup HLS on component unmount
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const activeSchedules = activeSchedulesRef.current;
    if (!currentContent || activeSchedules.length === 0) return;

    console.log('Setting up content rotation for:', currentContent.title, 'type:', currentContent.type);
    
    const rotateContent = () => {
      console.log('Rotating content...');
      const nextIndex = (currentScheduleIndex + 1) % activeSchedules.length;
      setCurrentScheduleIndex(nextIndex);
      setCurrentContent(activeSchedules[nextIndex].content);
      setCurrentPage(0);
      animateContent();
    };

    if (getActualMediaType(currentContent.url, currentContent.type) === 'video' && videoRef.current) {
      console.log('Setting up video ended handler');
      
      // Cleanup previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      const videoElement = videoRef.current;
      const videoUrl = currentContent.url;
      
      // React doesn't properly set the muted property — set it explicitly
      videoElement.muted = true;
      videoElement.playbackRate = 1;
      
      // Fallback: if onended doesn't fire within 10 minutes, force rotate
      timeoutRef.current = window.setTimeout(() => {
        console.warn('Video fallback timeout triggered, rotating to next content');
        rotateContent();
      }, 10 * 60 * 1000);
      
      // Check if it's an HLS stream
      if (videoUrl.includes('.m3u8')) {
        console.log('Setting up HLS playback for:', videoUrl);
        
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: false,
            lowLatencyMode: true,
          });
          hlsRef.current = hls;
          
          hls.loadSource(videoUrl);
          hls.attachMedia(videoElement);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest parsed, starting playback');
            videoElement.muted = true;
            videoElement.play().catch(err => {
              console.error('HLS play error:', err);
              // If play fails, try again after a short delay
              setTimeout(() => {
                videoElement.muted = true;
                videoElement.play().catch(e => console.error('HLS retry play failed:', e));
              }, 500);
            });
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.log('Fatal error, rotating to next content');
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  rotateContent();
                  break;
              }
            }
          });
          
          videoElement.onended = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            rotateContent();
          };
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS support
          console.log('Using Safari native HLS support');
          videoElement.src = videoUrl;
          videoElement.load();
          videoElement.onended = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            rotateContent();
          };
          videoElement.oncanplay = () => {
            videoElement.muted = true;
            videoElement.play().catch(err => {
              console.error('Safari HLS play error:', err);
              setTimeout(() => {
                videoElement.muted = true;
                videoElement.play().catch(e => console.error('Safari HLS retry failed:', e));
              }, 500);
            });
          };
        } else {
          console.error('HLS not supported, rotating to next content');
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          rotateContent();
        }
      } else {
        // Regular video file
        console.log('Setting up regular video playback for:', videoUrl);
        videoElement.src = videoUrl;
        videoElement.load();
        videoElement.onended = () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          rotateContent();
        };
        videoElement.oncanplay = () => {
          videoElement.muted = true;
          videoElement.play().catch(err => {
            console.error('Video play error:', err);
            // Retry after short delay
            setTimeout(() => {
              videoElement.muted = true;
              videoElement.play().catch(e => console.error('Video retry play failed:', e));
            }, 500);
          });
        };
        videoElement.onerror = (e) => {
          console.error('Video error, rotating to next content:', e);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          rotateContent();
        };
      }
    } else {
      console.log('Setting up timeout for non-video content');
      timeoutRef.current = window.setTimeout(rotateContent, SLIDE_DURATION);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.onended = null;
        videoRef.current.onerror = null;
        videoRef.current.onloadstart = null;
        videoRef.current.oncanplay = null;
        videoRef.current.pause();
      }
    };
  }, [currentContent, currentScheduleIndex, animateContent, screen?.layout_type]);

  useEffect(() => {
    updateActiveContents();
    const interval = setInterval(updateActiveContents, FETCH_INTERVAL);
    return () => clearInterval(interval);
  }, [updateActiveContents]);

  useEffect(() => {
    if (currentContent) {
      animateContent();
    }
  }, [currentContent, animateContent]);

  useEffect(() => {
    if (screen?.layout_type === 'full_text' && checkOverflow()) {
      const rotationInterval = setInterval(rotatePage, 5000);
      return () => clearInterval(rotationInterval);
    }
  }, [screen?.layout_type, checkOverflow, rotatePage]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-900">
        <div className="text-center">
          <p className="text-2xl mb-4">{error}</p>
          <p className="text-gray-500">Por favor, verifica el ID de la pantalla e intenta nuevamente.</p>
        </div>
      </div>
    );
  }

  if (!currentContent || !screen) {
    console.log('No content or screen:', { currentContent: !!currentContent, screen: !!screen });
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-900">
          <p className="text-2xl mb-2">Sin contenido programado</p>
          <p className="text-gray-500">
            No hay contenido para mostrar en este momento
          </p>
        </div>
      </div>
    );
  }

  console.log('Rendering content:', {
    title: currentContent.title,
    type: currentContent.type,
    url: currentContent.url,
    layoutType: screen.layout_type
  });
  // Layout: Solo texto
  if (screen.layout_type === 'full_text') {
    const categorySchedules = schedules.filter(s => 
      s.content.category === currentContent.category
    );

    const paginatedSchedules = categorySchedules.slice(
      currentPage * PAGE_SIZE,
      (currentPage + 1) * PAGE_SIZE
    );

    return (
      <>
        <div className="min-h-screen bg-white p-12">
          <div className="max-w-7xl mx-auto h-full" ref={contentRef}>
            <h1 className="menu-category font-bold mb-12 text-primary">
              {categoryTitles[currentContent.category]}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-240px)] overflow-hidden" ref={gridRef}>
              <div className="contents" ref={menuRef}>
                {paginatedSchedules.map((schedule) => {
                  const content = schedule.content;
                  return (
                    <div
                      key={schedule.id}
                      className="border-b border-gray-200 pb-6"
                    >
                      <h2 className="menu-title font-medium mb-2 text-gray-900">
                        {content.title}
                      </h2>
                      {content.description && (
                        <p className="menu-text text-gray-600 mb-3">
                          {content.description}
                        </p>
                      )}
                      {content.has_sizes ? (
                        <div className="space-y-3">
                          {content.sizes?.map(size => (
                            <div key={size.id} className="flex justify-between items-center">
                              <span className="menu-text text-gray-700">{size.size.name}</span>
                              <span className="menu-price font-bold text-primary">
                                {formatPrice(size.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="menu-price font-bold text-primary">
                          {formatPrice(content.price)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <MessageBanner screenId={screenId} />
      </>
    );
  }

  // Layout: Solo imágenes o videos
  if (screen.layout_type === 'full_image') {
    const actualMediaType = getActualMediaType(currentContent.url, currentContent.type);

    return (
      <>
        <div className="min-h-screen bg-black overflow-hidden">
          <div className="h-screen">
            {actualMediaType === 'image' ? (
              <img
                src={currentContent.url}
                alt={currentContent.title}
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop={activeSchedulesRef.current.length <= 1}
                playsInline
                controls={false}
                preload="auto"
                className="w-full h-full object-contain bg-black"
                style={{ display: 'block' }}
              />
            )}
          </div>
        </div>
        <MessageBanner screenId={screenId} />
      </>
    );
  }

  // Layout: Video pantalla completa con rotación de contenido programado
  if (screen.layout_type === 'video_fullscreen') {
    const actualMediaType = getActualMediaType(currentContent.url, currentContent.type);

    return (
      <>
        <div className="min-h-screen bg-black overflow-hidden">
          <div className="h-screen">
            {actualMediaType === 'video' ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop={activeSchedulesRef.current.length <= 1}
                playsInline
                controls={false}
                preload="auto"
                className="w-full h-full object-cover bg-black"
                style={{ display: 'block' }}
              />
            ) : (
              <img
                src={currentContent.url}
                alt={currentContent.title}
                className="w-full h-full object-cover bg-black"
              />
            )}
          </div>
        </div>
        <MessageBanner screenId={screenId} />
      </>
    );
  }

  // Layout: Imagen y texto (split)
  const activeSchedules = activeSchedulesRef.current;
  const categorySchedules = activeSchedules.filter(s => 
    s.content.category === currentContent.category
  );
  
  const actualMediaType = getActualMediaType(currentContent.url, currentContent.type);

  return (
    <>
      <div className="min-h-screen bg-white text-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          <div className="overflow-hidden">
            {actualMediaType === 'image' ? (
              <img
                src={currentContent.url}
                alt={currentContent.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop={activeSchedulesRef.current.length <= 1}
                playsInline
                controls={false}
                preload="auto"
                className="w-full h-full object-cover"
                style={{ display: 'block' }}
              />
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-8 lg:p-12" ref={contentRef}>
              <h2 className="menu-title font-bold mb-3">
                {currentContent.title}
              </h2>
              {currentContent.description && (
                <p className="menu-text text-gray-600">
                  {currentContent.description}
                </p>
              )}
              {currentContent.has_sizes && (
                <div className="mt-4 space-y-2">
                  {currentContent.sizes?.map(size => (
                    <div key={size.id} className="flex justify-between items-center max-w-xl">
                      <span className="menu-text text-gray-700">{size.size.name}</span>
                      <span className="menu-price font-bold text-primary">
                        {formatPrice(size.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-12 bg-white">
            <h3 className="menu-category font-bold mb-8 text-primary">
              {categoryTitles[currentContent.category]}
            </h3>

            <div className="space-y-6 lg:space-y-8" ref={menuRef}>
              {categorySchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`flex items-start justify-between border-b border-gray-200 pb-6`}
                >
                  <div className="flex-1">
                    <h4 className="menu-title font-medium text-gray-900">
                      {schedule.content.title}
                    </h4>
                    {schedule.content.description && (
                      <p className="menu-text text-gray-600 mt-2">
                        {schedule.content.description}
                      </p>
                    )}
                    {schedule.content.has_sizes && (
                      <div className="mt-3 space-y-2">
                        {schedule.content.sizes?.map(size => (
                          <div key={size.id} className="flex justify-between items-center">
                            <span className="menu-text text-gray-700">{size.size.name}</span>
                            <span className="menu-price font-bold text-primary">
                              {formatPrice(size.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {!schedule.content.has_sizes && (
                    <div className="menu-price font-bold text-primary ml-6">
                      {formatPrice(schedule.content.price)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MessageBanner screenId={screenId} />
    </>
  );
};

export default Preview;