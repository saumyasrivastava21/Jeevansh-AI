import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  Clock,
  MapPin,
  Languages,
  Filter,
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  FileText,
  Activity,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { appointmentApi, Appointment } from "@/lib/appointmentApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const specialties = [
  "All",
  "Radiologist",
  "Pulmonologist",
  "Oncologist",
  "Orthopedic Surgeon",
  "Ophthalmologist",
  "Dermatologist",
];

const standardSlots = [
  "09:30 AM",
  "11:00 AM",
  "02:00 PM",
  "03:30 PM",
  "05:00 PM",
  "06:30 PM",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5 },
  }),
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export default function FindDoctors() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [selected, setSelected] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const tomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const todayStr = () => new Date().toISOString().split("T")[0];

  const [appointmentDate, setAppointmentDate] = useState(tomorrowStr());
  const [appointmentTime, setAppointmentTime] = useState("03:30 PM");
  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(
    null
  );

  useEffect(() => {
    apiFetch("/doctors")
      .then((res) => {
        if (res.success) setDoctors(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openBookingModal = (doctor: any) => {
    setSelected(doctor);
    setBookingError(null);
    setBookedAppointment(null);
    setReason("");
    setSymptoms("");
    setAppointmentDate(tomorrowStr());
    setAppointmentTime("03:30 PM");
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!reason.trim()) {
      setBookingError("Please describe the consultation reason.");
      return;
    }

    if (!appointmentDate) {
      setBookingError("Please pick an appointment date.");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const appointment = await appointmentApi.book({
        doctorId: selected._id,
        appointmentDate,
        appointmentTime,
        reason: reason.trim(),
        symptoms: symptoms.trim() || undefined,
      });

      setBookedAppointment(appointment);
      toast({
        title: "Appointment Requested!",
        description: `Your consultation request with ${selected.userId?.name || "the doctor"} has been submitted.`,
        variant: "success",
      });
    } catch (err: any) {
      console.error(err);
      setBookingError(
        err.message || "Failed to book appointment. Please choose a different slot."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const filtered = doctors.filter(
    (d) =>
      (specialty === "All" || d.specialty === specialty) &&
      (d.userId?.name?.toLowerCase().includes(query.toLowerCase()) ||
        d.specialty?.toLowerCase().includes(query.toLowerCase()) ||
        d.hospital?.toLowerCase().includes(query.toLowerCase()) ||
        d.location?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Find <span className="gradient-text">Specialist Doctors</span>
          </h1>
          <p className="text-muted-foreground">
            Connect with verified specialists for expert medical consultations and AI scan reviews.
          </p>
        </div>
        {isAuthenticated && user?.role === "patient" && (
          <Button asChild variant="outline" className="rounded-xl self-start md:self-auto gap-2">
            <Link to="/appointments">
              <CalendarIcon className="w-4 h-4 text-primary" />
              My Appointments
            </Link>
          </Button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 h-11 rounded-xl"
            placeholder="Search by doctor name, specialty, hospital, city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-3.5" />
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSpecialty(s)}
              className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                specialty === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Doctor grid */}
      {loading ? (
        <div className="text-center py-20 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
          <p className="text-muted-foreground">Loading verified specialists...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No doctors match your search query.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doctor, i) => (
            <motion.div
              key={doctor._id}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              animate="visible"
            >
              <Card className="medical-card group h-full flex flex-col justify-between">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            doctor.userId?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              doctor.userId?.name || "Dr"
                            )}&background=0B3C5D&color=fff`
                          }
                          alt={doctor.userId?.name || "Doctor"}
                          className="w-14 h-14 rounded-2xl object-cover"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                            doctor.available ? "bg-emerald-500" : "bg-amber-400"
                          }`}
                          title={doctor.available ? "Available" : "Busy"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">
                          {doctor.userId?.name || "Unknown Doctor"}
                        </h3>
                        <p className="text-primary text-sm font-medium">
                          {doctor.specialty}
                        </p>
                        <p className="text-muted-foreground text-xs truncate">
                          {doctor.subSpecialty || "General Specialist"}
                        </p>
                      </div>
                      <Badge
                        variant={doctor.available ? "success" : "warning"}
                        className="flex-shrink-0 text-[10px]"
                      >
                        {doctor.available ? "Available" : "Busy"}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <StarRating rating={doctor.rating || 4.8} />
                        <span className="text-xs text-muted-foreground">
                          {doctor.rating || 4.8} ({doctor.reviewCount || 120} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />{" "}
                        <span className="truncate">{doctor.hospital}, {doctor.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />{" "}
                        <span>Next Slot: {doctor.nextSlot || "Today"} · {doctor.experience}y exp</span>
                      </div>
                      {doctor.languages && doctor.languages.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Languages className="w-3.5 h-3.5 text-primary flex-shrink-0" />{" "}
                          <span className="truncate">{doctor.languages.join(", ")}</span>
                        </div>
                      )}
                      {doctor.bio && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 pt-1 border-t border-border/50">
                          {doctor.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                    <div>
                      <p className="text-lg font-bold">
                        ₹{doctor.consultationFee}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        per consultation
                      </p>
                    </div>
                    <Button
                      variant="medical"
                      size="sm"
                      onClick={() => openBookingModal(doctor)}
                      className="rounded-xl shadow-sm"
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Book Dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setBookedAppointment(null);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {bookedAppointment ? "Booking Confirmation" : "Book Medical Consultation"}
            </DialogTitle>
            <DialogDescription>
              {bookedAppointment
                ? "Your consultation appointment details"
                : `Schedule a consultation session with ${selected?.userId?.name || "Doctor"}`}
            </DialogDescription>
          </DialogHeader>

          {selected && !bookedAppointment && (
            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-1">
              {/* Doctor Summary */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/60 border border-border">
                <img
                  src={
                    selected.userId?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selected.userId?.name || "Dr"
                    )}&background=0B3C5D&color=fff`
                  }
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{selected.userId?.name}</p>
                  <p className="text-xs text-primary font-medium">{selected.specialty} · {selected.hospital}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{selected.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-foreground">₹{selected.consultationFee}</span>
                  <p className="text-[10px] text-muted-foreground">Fee</p>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Please log in to your patient account to confirm this booking.
                  </p>
                  <Button
                    type="button"
                    variant="medical"
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate("/login")}
                  >
                    <LogIn className="w-4 h-4" /> Log In to Book
                  </Button>
                </div>
              ) : (
                <>
                  {/* Date Picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                      Select Appointment Date
                    </label>
                    <Input
                      type="date"
                      min={todayStr()}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Select Available Time Slot
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {standardSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setAppointmentTime(slot)}
                          className={`p-2 rounded-xl border text-xs font-medium transition-all text-center ${
                            appointmentTime === slot
                              ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                              : "border-border hover:border-primary/50 hover:bg-muted/60 text-muted-foreground"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      Reason for Consultation <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Chest X-Ray review, fever and dry cough follow-up"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  {/* Symptoms & Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      Symptoms / Medical Notes (Optional)
                    </label>
                    <Textarea
                      placeholder="Describe symptoms, duration, or any previous diagnoses..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={2}
                      className="rounded-xl resize-none text-xs"
                    />
                  </div>

                  {bookingError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Fee</p>
                      <p className="text-lg font-black text-primary">₹{selected.consultationFee}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSelected(null)}
                        disabled={bookingLoading}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="medical"
                        disabled={bookingLoading}
                        className="rounded-xl gap-2 font-bold"
                      >
                        {bookingLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Success State */}
          {bookedAppointment && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Appointment Booked!</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your appointment request has been submitted to {selected?.userId?.name}. You can track status updates in your dashboard.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/60 border border-border text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor:</span>
                  <span className="font-semibold">{selected?.userId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialty:</span>
                  <span>{selected?.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-semibold text-primary">
                    {new Date(bookedAppointment.appointmentDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    at {bookedAppointment.appointmentTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="pending" className="text-[10px] uppercase">
                    {bookedAppointment.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <span className="truncate max-w-[200px]">{bookedAppointment.reason}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelected(null);
                    setBookedAppointment(null);
                  }}
                  className="rounded-xl"
                >
                  Book Another
                </Button>
                <Button
                  variant="medical"
                  onClick={() => {
                    setSelected(null);
                    navigate("/appointments");
                  }}
                  className="rounded-xl gap-2 font-bold"
                >
                  View Appointments <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
