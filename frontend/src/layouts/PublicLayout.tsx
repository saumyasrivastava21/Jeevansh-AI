import { Outlet } from 'react-router-dom';
import PublicNavbar from '@/components/PublicNavbar';
import PageTransition from '@/components/PageTransition';
import { Activity, Mail, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-medical-blue flex items-center justify-center">
                  <Activity className="w-4 h-4 text-medical-cyan" />
                </div>
                <span className="font-bold text-lg">Jeevansh <span className="text-medical-cyan">AI</span></span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered medical diagnosis platform making healthcare accessible for everyone.
              </p>
              <div className="flex gap-3 mt-4">
                {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-medical-blue transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
            {/* Links */}
            {[
              { title: 'Platform', links: [['Dashboard', '/dashboard'], ['Diseases', '/diseases'], ['Find Doctors', '/find-doctors'], ['Tutorial', '/tutorial']] },
              { title: 'Company', links: [['About Us', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#'], ['Contact', '#']] },
              { title: 'Support', links: [['Help Center', '#'], ['Community', '/community'], ['API Docs', '#'], ['Status', '#']] },
            ].map(section => (
              <div key={section.title}>
                <h4 className="font-semibold text-foreground mb-3">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map(([label, to]) => (
                    <li key={label}>
                      <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© 2026 Jeevansh AI. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Made with ❤️ for better healthcare</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
