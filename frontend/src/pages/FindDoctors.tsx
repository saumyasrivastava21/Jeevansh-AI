import { useState, useEffect } from "react";
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
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
          className={`w-3.5 h-3.5 ${s <= Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted"
            }`}
        />
      ))}
    </div>
  );
}

export default function FindDoctors() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [selected, setSelected] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/doctors")
      .then((res) => {
        if (res.success) setDoctors(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(
    (d) =>
      (specialty === "All" || d.specialty === specialty) &&
      (d.userId?.name?.toLowerCase().includes(query.toLowerCase()) ||
        d.specialty?.toLowerCase().includes(query.toLowerCase()) ||
        d.hospital?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Find <span className="gradient-text">Specialist Doctors</span>
        </h1>
        <p className="text-muted-foreground">
          Connect with verified specialists for expert medical consultations.
        </p>
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
            placeholder="Search by name, specialty, hospital..."
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
              className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${specialty === s
                  ? "bg-primary text-primary-foreground"
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
          <p className="text-muted-foreground">Loading doctors...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No doctors match your search.</p>
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
              <Card className="medical-card group">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
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
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${doctor.available ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate">
                        {doctor.userId?.name || "Unknown"}
                      </h3>
                      <p className="text-primary text-sm font-medium">
                        {doctor.specialty}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {doctor.subSpecialty}
                      </p>
                    </div>
                    <Badge
                      variant={doctor.available ? "success" : "pending"}
                      className="flex-shrink-0"
                    >
                      {doctor.available ? "Available" : "Busy"}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <StarRating rating={doctor.rating} />
                      <span className="text-xs text-muted-foreground">
                        {doctor.rating} ({doctor.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {doctor.hospital},{" "}
                      {doctor.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> Next: {doctor.nextSlot} ·{" "}
                      {doctor.experience}y exp
                    </div>
                    {doctor.languages && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Languages className="w-3 h-3" />{" "}
                        {doctor.languages.join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-lg font-bold">
                        ₹{doctor.consultationFee}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        per consultation
                      </p>
                    </div>
                    <Button
                      variant="medical"
                      size="sm"
                      onClick={() => setSelected(doctor)}
                      className="rounded-xl"
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

      {/* Book dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Consultation</DialogTitle>
            <DialogDescription>
              Schedule a consultation with {selected?.userId?.name}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
                <img
                  src={
                    selected.userId?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selected.userId?.name || "Dr"
                    )}&background=0B3C5D&color=fff`
                  }
                  alt=""
                  className="w-12 h-12 rounded-xl"
                />
                <div>
                  <p className="font-semibold">{selected.userId?.name}</p>
                  <p className="text-sm text-primary">{selected.specialty}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.hospital}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Today, 3:00 PM",
                  "Today, 5:00 PM",
                  "Tomorrow, 10:00 AM",
                  "Tomorrow, 2:00 PM",
                ].map((slot) => (
                  <button
                    key={slot}
                    className="p-2.5 rounded-xl border border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium text-left"
                  >
                    📅 {slot}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="text-xl font-bold">
                    ₹{selected.consultationFee}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Consultation fee
                  </p>
                </div>
                <Button variant="medical" onClick={() => setSelected(null)}>
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
