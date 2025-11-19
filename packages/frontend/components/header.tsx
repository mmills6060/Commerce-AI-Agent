import Link from "next/link"
import { ShoppingBag, Search } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">ACME</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
            >
              All
            </Link>
            <Link 
              href="/search?category=clothing" 
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
            >
              Clothing
            </Link>
            <Link 
              href="/search?category=accessories" 
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
            >
              Accessories
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link 
            href="/cart"
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent transition-colors relative"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              0
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}

