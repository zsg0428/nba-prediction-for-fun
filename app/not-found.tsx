"use client";

import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/Nav/NavBar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-8 flex justify-center">
          <BasketballNotFoundIcon />
        </div>

        <h1 className="mb-4 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-4xl font-bold text-transparent">
          404 - Page Not Found
        </h1>

        <p className="mb-8 max-w-md text-gray-400">
          Looks like this play didn't make it to the scoreboard. The page you're
          looking for might have been traded to another team.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home Court
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

function BasketballNotFoundIcon() {
  return (
    <div className="relative">
      <svg
        width="150"
        height="150"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="#F97316"
          stroke="#FDBA74"
          strokeWidth="5"
        />
        <path d="M100 5C100 5 100 100 100 195" stroke="black" strokeWidth="3" />
        <path
          d="M195 100C195 100 100 100 5 100"
          stroke="black"
          strokeWidth="3"
        />
        <path
          d="M170 30C170 30 100 100 30 170"
          stroke="black"
          strokeWidth="3"
        />
        <path
          d="M170 170C170 170 100 100 30 30"
          stroke="black"
          strokeWidth="3"
        />

        {/* X mark for "not found" */}
        <path
          d="M65 65L135 135"
          stroke="#7F1D1D"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M135 65L65 135"
          stroke="#7F1D1D"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute -bottom-4 -right-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-orange-500 bg-gray-800 text-xl font-bold text-white">
        404
      </div>
    </div>
  );
}
