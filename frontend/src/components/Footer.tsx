import AnimationContainer from "@/components/ui/animation-container"
import Logo from "./Logo"

const Footer = () => {
    return (
        <footer className="flex flex-col relative items-center justify-center border-t border-border pt-16 pb-8 md:pb-0 px-6 lg:px-8 w-full max-w mx-auto lg:pt-32 bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)]">

            <div className="absolute top-0 left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1.5 bg-foreground rounded-full"></div>

            <div className="grid gap-8 xl:grid-cols-3 xl:gap-8 w-full px-4 max-w-6xl">

                <AnimationContainer delay={0.1}>
                    <div className="flex flex-col items-start justify-start md:max-w-50">
                        <div className="flex items-start">
                            <Logo />
                        </div>
                        <p className="text-muted-foreground mt-4 text-sm text-start">
                            Manage your as with ease.
                        </p>
                        <span className="mt-4 text-foreground/80 text-sm flex items-center">
                            Made by <a href="https://shreyas-sihasane.vercel.app/" className="font-semibold ml-1">Shreyas</a>
                        </span>
                    </div>
                </AnimationContainer>

                <div className="grid-cols-2 gap-8 grid mt-16 xl:col-span-2 xl:mt-0">
                    <div className="md:grid md:grid-cols-2 md:gap-8">
                        <AnimationContainer delay={0.2}>
                            <div>
                                <h3 className="text-base font-medium text-foreground">
                                    Product
                                </h3>
                                <ul className="mt-4 text-sm text-muted-foreground">
                                    <li className="mt-2">
                                        <a href="" className="hover:text-foreground transition-all duration-300">
                                            Features
                                        </a>
                                    </li>
                                    <li className="mt-2">
                                        <a href="" className="hover:text-foreground transition-all duration-300">
                                            Pricing
                                        </a>
                                    </li>
                                    <li className="mt-2">
                                        <a href="" className="hover:text-foreground transition-all duration-300">
                                            Testimonials
                                        </a>
                                    </li>
                                    <li className="mt-2">
                                        <a href="" className="hover:text-foreground transition-all duration-300">
                                            Integration
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </AnimationContainer>
                        <AnimationContainer delay={0.3}>
                            <div className="mt-10 md:mt-0 flex flex-col">
                                <h3 className="text-base font-medium text-foreground">
                                    Integrations
                                </h3>
                                <ul className="mt-4 text-sm text-muted-foreground">
                                    <li>
                                        <a href="" className="hover:text-foreground transition-all duration-300">
                                            Facebook
                                        </a>
                                    </li>
                                    <li className="mt-2">
                                        <a href="" className="hover:text-foreground transition-all duration-300">
                                            Instagram
                                        </a>
                                    </li>
                                    <li className="mt-2">
                                        <a href="" className="hover:text-foreground transition-all duration-300">
                                            Twitter
                                        </a>
                                    </li>
                                    <li className="mt-2">
                                        <a href="" className="hover:text-foreground transition-all duration-300">
                                            aedIn
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </AnimationContainer>
                    </div>
                    <div className="md:grid md:grid-cols-2 md:gap-8">
                        <AnimationContainer delay={0.4}>
                            <div>
                                <h3 className="text-base font-medium text-foreground">
                                    Resources
                                </h3>
                                <ul className="mt-4 text-sm text-muted-foreground">
                                    <li className="mt-2">
                                        <a href="/resources/blog" className="hover:text-foreground transition-all duration-300">
                                            Blog
                                        </a>
                                    </li>
                                    <li className="mt-2">
                                        <a href="/resources/help" className="hover:text-foreground transition-all duration-300">
                                            Support
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </AnimationContainer>
                        <AnimationContainer delay={0.5}>
                            <div className="mt-10 md:mt-0 flex flex-col">
                                <h3 className="text-base font-medium text-foreground">
                                    Company
                                </h3>
                                <ul className="mt-4 text-sm text-muted-foreground">
                                    <li>
                                        <a href="" className="hover:text-foreground transition-all duration-300">
                                            About Us
                                        </a>
                                    </li>
                                    <li className="mt-2">
                                        <a href="/privacy" className="hover:text-foreground transition-all duration-300">
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li className="mt-2">
                                        <a href="/terms" className="hover:text-foreground transition-all duration-300">
                                            Terms & Conditions
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </AnimationContainer>
                    </div>
                </div>

            </div>

            <div className="mt-8 border-t border-border/40 pt-4 md:pt-8 md:flex md:items-center md:justify-between w-full">
                <AnimationContainer delay={0.6}>
                    <p className="text-sm text-muted-foreground mt-8 md:mt-0">
                        &copy; {new Date().getFullYear()} aify INC. All rights reserved.
                    </p>
                </AnimationContainer>
            </div>
        </footer>
    )
}

export default Footer
