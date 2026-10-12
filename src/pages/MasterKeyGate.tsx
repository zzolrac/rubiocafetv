import React, { useState, useEffect } from 'react';
import { Coffee, Lock, ArrowRight, KeyRound, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useMasterKeyStore } from '../store/masterKeyStore';

const MasterKeyGate = () => {
  const { isUnlocked, isLoading, error, verifyPin, changePin, lock } = useMasterKeyStore();
  const [pin, setPin] = useState('');
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState(false);

  if (isUnlocked) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyPin(pin);
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(false);

    if (newPin !== confirmPin) {
      setChangeError('Las claves nuevas no coinciden');
      return;
    }
    if (newPin.length < 4) {
      setChangeError('La nueva clave debe tener al menos 4 caracteres');
      return;
    }

    const success = await changePin(currentPin, newPin);
    if (success) {
      setChangeSuccess(true);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => {
        setShowChangeForm(false);
        setChangeSuccess(false);
      }, 2000);
    } else {
      setChangeError(error || 'No se pudo cambiar la clave');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#FFF0E6] to-[#FFE8D6] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Coffee className="text-primary" size={40} />
          <h1 className="text-2xl font-bold text-gray-900">RubioCafé TV</h1>
        </div>

        {!showChangeForm ? (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="text-primary" size={28} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Clave Maestra</h2>
              <p className="text-sm text-gray-500">Ingresa la clave para acceder al panel</p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Clave maestra"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 text-base text-center tracking-widest"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !pin.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    Desbloquear
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => {
                setShowChangeForm(true);
                setChangeError(null);
                setChangeSuccess(false);
              }}
              className="w-full text-center text-sm text-gray-400 hover:text-primary mt-6 transition-colors"
            >
              ¿Cambiar clave maestra?
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col items-center text-center w-full">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <KeyRound className="text-primary" size={28} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Cambiar Clave</h2>
                <p className="text-sm text-gray-500">Ingresa la clave actual y la nueva</p>
              </div>
              <button
                onClick={() => {
                  setShowChangeForm(false);
                  setChangeError(null);
                  setChangeSuccess(false);
                  setCurrentPin('');
                  setNewPin('');
                  setConfirmPin('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors absolute top-6 right-6"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleChangePin} className="space-y-4">
              {changeError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {changeError}
                </div>
              )}
              {changeSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <CheckCircle size={18} className="flex-shrink-0" />
                  Clave cambiada correctamente
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Clave actual"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 text-base"
                  required
                />
              </div>

              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Nueva clave (mín. 4 caracteres)"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 text-base"
                  required
                />
              </div>

              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirmar nueva clave"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 text-base"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !currentPin.trim() || !newPin.trim() || !confirmPin.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar nueva clave'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MasterKeyGate;
