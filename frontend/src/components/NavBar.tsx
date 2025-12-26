import { Button } from "./ui/button"
import { ArrowRight } from 'lucide-react'
import logo from '/logo.svg'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card"

const NavBar = () => {
  return (
    <nav className="sticky top-0 flex items-center w-full p-3 border-b-2 pl-10">
      <div className="flex flex-1 items-center gap-3">
        <img src={logo} className="h-8 hover:drop-shadow-[0_0_5px_rgba(60,130,240,1)] transition-all" />
        <p className="text-xl hover:drop-shadow-[0_0_10px_rgba(60,130,240,1)] transition-all">Katana ID</p>
      </div>
      <div className="flex flex-1 items-center justify-center gap-3">
        <HoverCard openDelay={200} closeDelay={400}>
          <HoverCardTrigger asChild>
            <Button variant="ghost">Developers</Button>
          </HoverCardTrigger>
          <HoverCardContent className="flex gap-2 mt-2 bg-popover p-2 rounded-md border">
            <Button variant="ghost">Khiem Nguyen</Button>
            <Button variant="ghost">Anh Tran</Button>
          </HoverCardContent>
        </HoverCard>
        <Button variant="ghost">Demo</Button>
        <Button variant="ghost">Contact</Button>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <Button variant="ghost" className="">Sign in</Button>
        <Button variant="default" className="">Verify a media <ArrowRight className="ml-5" /></Button>
      </div>
    </nav>
  )
}

export default NavBar