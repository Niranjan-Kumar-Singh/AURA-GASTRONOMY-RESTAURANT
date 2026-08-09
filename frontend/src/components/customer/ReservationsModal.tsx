import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Loader } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { contentService } from '../../services/content.service';
import { useAuthStore } from '../../store/use-auth-store';

interface ReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationsModal: React.FC<ReservationsModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore(state => state.user);



  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contentService.createReservation({
        userId: user?._id,
        customerName: user?.name || 'Guest',
        phone: user?.phone || '0000000000',
        date,
        time,
        partySize: guests
      });
      showToast('Reservation confirmed! Check your email for details.', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to book reservation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-aura-obsidian border border-aura-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="p-6 border-b border-aura-border flex items-center justify-between bg-aura-container relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-aura-gold" />
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-aura-ivory">Book a Table</h2>
              <p className="text-xs text-aura-slate">Reserve your luxury dining experience</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-aura-obsidian hover:bg-black rounded-full text-aura-ivory transition-colors relative z-10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBook} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-aura-gold uppercase tracking-wider">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-aura-slate" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-aura-container border border-aura-border rounded-xl py-2.5 pl-9 pr-3 text-sm text-aura-ivory focus:outline-none focus:border-aura-gold" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-aura-gold uppercase tracking-wider">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-aura-slate" />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="w-full bg-aura-container border border-aura-border rounded-xl py-2.5 pl-9 pr-3 text-sm text-aura-ivory focus:outline-none focus:border-aura-gold" />
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-aura-gold uppercase tracking-wider">Guests</label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-4 h-4 text-aura-slate" />
              <select required value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-aura-container border border-aura-border rounded-xl py-2.5 pl-9 pr-3 text-sm text-aura-ivory focus:outline-none focus:border-aura-gold appearance-none">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} People</option>)}
              </select>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-3.5 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold rounded-xl text-sm uppercase tracking-wider transition-all shadow-xl active:scale-95 flex items-center justify-center">
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
};
