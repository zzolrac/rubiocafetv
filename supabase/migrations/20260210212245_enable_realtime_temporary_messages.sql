/*
  # Enable Realtime for Temporary Messages

  1. Changes
    - Enable realtime replication for temporary_messages table
    - Allow real-time updates for birthday messages

  2. Purpose
    - Enable instant message updates without page refresh
    - Messages appear immediately on screens when created
    - Improve user experience with real-time synchronization
*/

ALTER PUBLICATION supabase_realtime ADD TABLE temporary_messages;