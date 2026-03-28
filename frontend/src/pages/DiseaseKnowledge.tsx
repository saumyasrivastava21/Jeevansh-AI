import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronRight, AlertCircle } from 'lucide-react';
import { mockDiseases } from '@/data/mock/diseases';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const severityColor = { low: 'success', medium: 'warning', high: 'danger' } as const;

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.5 } }) };

export default function DiseaseKnowledge() {
  const [query, setQuery] = useState('');
  const filtered = mockDiseases.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.shortDescription.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-10">
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Medical Knowledge Base</span>
        <h1 className="text-4xl font-bold mb-4">Disease Information <span className="gradient-text">Library</span></h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Comprehensive knowledge about diseases detected by Jeevansh AI — symptoms, causes, treatment, and prevention.</p>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible" className="max-w-xl mx-auto mb-10 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-10 h-12 rounded-xl" placeholder="Search diseases..." value={query} onChange={e => setQuery(e.target.value)} />
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No diseases match your search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((d, i) => (
            <motion.div key={d.id} variants={fadeUp} custom={i} initial="hidden" animate="visible">
              <Link to={`/diseases/${d.id}`}>
                <Card className="medical-card group cursor-pointer h-full overflow-hidden">
                  <div className="h-40 overflow-hidden relative">
                    <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="text-2xl">{d.icon}</span>
                      <p className="text-white font-bold">{d.name}</p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant={severityColor[d.severity]}>{d.severity} risk</Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{d.shortDescription}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {d.symptoms.slice(0, 3).map(s => (
                        <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                      ))}
                      {d.symptoms.length > 3 && <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{d.symptoms.length - 3} more</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{d.prevalence}</p>
                      <div className="flex items-center gap-1 text-primary text-xs font-medium group-hover:gap-2 transition-all">
                        Learn more <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
