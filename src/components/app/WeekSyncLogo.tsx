import { type SVGProps } from "react";

export default function WeekSyncLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <rect width="32" height="32" rx="8" fill="url(#paint0_linear_1_2)" />
            <path
                d="M9 16.5L13 20.5L23.5 10"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient
                    id="paint0_linear_1_2"
                    x1="0"
                    y1="0"
                    x2="32"
                    y2="32"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#64B5F6" />
                    <stop offset="1" stopColor="#2196F3" />
                </linearGradient>
            </defs>
        </svg>
    )
}
