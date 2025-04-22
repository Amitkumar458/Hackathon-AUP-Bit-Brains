"use client";

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function NavMenu() {
  return (
    <div className="w-full bg-gradient-to-r from-green-50 via-white to-green-50 border-b border-green-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center px-4 py-3">
          {/* Logo Section - Left */}
          <Link href="/" className="flex items-center gap-2 min-w-[200px]">
            <Icons.logo className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold">
              <span className="text-green-600">Green</span> Island
            </span>
          </Link>

          {/* Navigation Section - Right */}
          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent hover:bg-green-100/50 text-base font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-green-800"
                )}>
                  <Link href="/">
                    <span className="flex items-center gap-2">
                      <Icons.home className="w-5 h-5" />
                      <span>Get Started</span>
                    </span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent hover:bg-green-100/50 text-base font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-green-800"
                )}>
                  <Link href="/segmentation">
                    <span className="flex items-center gap-2">
                      <Icons.layers className="w-5 h-5" />
                      <span>Segmentation</span>
                    </span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent hover:bg-green-100/50 text-base font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-green-800"
                )}>
                  <Link href="/map">
                    <span className="flex items-center gap-2">
                      <Icons.map className="w-5 h-5" />
                      <span>Map</span>
                    </span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent hover:bg-green-100/50 text-base font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-green-800"
                )}>
                  <Link href="/footprints">
                    <span className="flex items-center gap-2">
                      <Icons.footprints className="w-5 h-5" />
                      <span>Footprints</span>
                    </span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent hover:bg-green-100/50 text-base font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-green-800"
                )}>
                  <Link href="/">
                    <span className="flex items-center gap-2">
                      <Icons.bot className="w-5 h-5" />
                      <span>Ask AI</span>
                    </span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href || '#'}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
