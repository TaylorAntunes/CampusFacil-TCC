import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/" className="group inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-neon">
                <GraduationCap className="h-5 w-5 text-background" />
              </div>
              <span className="text-xl font-bold tracking-tight">CampusFácil</span>
            </Link>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Serviços internos da comunidade acadêmica do IFCE. Cadastro com e-mail institucional @ifce.edu.br.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <Link to="/explore" className="hover:text-primary transition-colors">
              Explorar
            </Link>
            <Link to="/conversas" className="hover:text-primary transition-colors">
              Conversas
            </Link>
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
          </div>
        </div>
        <div className="border-t border-border py-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CampusFácil. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
