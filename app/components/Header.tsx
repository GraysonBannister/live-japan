import Link from 'next/link';

interface HeaderProps {
  showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
  return (
    <header className="bg-[#FDFBF7] shadow-sm sticky top-0 z-50 border-b border-[#E7E5E4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-[#3F51B5] hover:text-[#283593]">
            Live Japan
          </Link>

          {/* Navigation */}
          {showNav && (
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="/" 
                className="text-sm text-[#78716C] hover:text-[#3F51B5] transition-colors"
              >
                Listings
              </Link>
              <Link 
                href="/map" 
                className="text-sm text-[#78716C] hover:text-[#3F51B5] transition-colors"
              >
                Map
              </Link>
              <Link 
                href="/relocation" 
                className="text-sm text-[#78716C] hover:text-[#3F51B5] transition-colors"
              >
                Relocation Support
              </Link>
              <Link 
                href="/auth" 
                className="text-sm font-medium text-[#3F51B5] hover:text-[#283593] transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth" 
                className="px-4 py-2 bg-[#3F51B5] text-white text-sm font-medium rounded-lg hover:bg-[#283593] transition-colors"
              >
                Sign Up
              </Link>
            </nav>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link 
              href="/auth" 
              className="px-3 py-1.5 bg-[#3F51B5] text-white text-sm font-medium rounded-lg hover:bg-[#283593] transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
