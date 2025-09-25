import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="w-full py-4 mt-8 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>© 2025 AI Summit Ideas</span>
            <Link href="/admin-login">
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-admin-footer"
              >
                Admin
              </button>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}