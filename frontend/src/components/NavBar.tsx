import { Button } from "./ui/button"
import { ArrowRight } from 'lucide-react'
import logo from '/logo.svg'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card"
import { Card, CardContent } from "./ui/card"

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between w-full px-3 py-3 border-b-2 pl-10 pr-10">
      <div className="flex items-center gap-2">
        <img src={logo} className="h-8 hover:drop-shadow-[0_0_5px_rgba(59,130,246,0.8)] transition-shadow"></img>
        <p className="font-mono font-bold hover:drop-shadow-[0_0_5px_rgba(59,130,246,0.8)] transition-shadow">Katana ID</p>
      </div>
      <div className="flex items-center gap-3">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost">Developers</Button>
          </HoverCardTrigger>
          <HoverCardContent className="flex gap-2">
            <Card className="p-0">
              <CardContent className="p-2">
                <Button variant="ghost">Khiem Nguyen</Button>
                <Button variant="ghost">Anh Tran</Button>
              </CardContent>
            </Card>
          </HoverCardContent>
        </HoverCard>
        <Button variant="ghost">Demo</Button>
        <Button variant="ghost">Contact</Button>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="">Sign in</Button>
        <Button variant="default" className="">Verify a media <ArrowRight /></Button>
      </div>
    </nav>
  )
}

export default NavBar