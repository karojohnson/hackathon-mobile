/**
 * Lucide fallback icons. tastytrade has a real icon library
 * (tastyworks-ui-design-tokens/input/icons/, ~427 icons) but pulling one in
 * ad hoc is slow — see docs/design-foundation.md. Import fallbacks from here
 * (not directly from "lucide-react") so every stand-in icon is easy to find
 * and swap for an official one later: `grep -r "from \"@/lib/icons\""`.
 */
export {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  Home,
  LineChart,
  Minus,
  Plus,
  Search,
  Settings,
  User,
  Wallet,
  X,
} from "lucide-react"
