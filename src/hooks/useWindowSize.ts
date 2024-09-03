import { useEffect, useState } from "react";

interface Size {
    width: number,
    height: number,
}

export default function useWindowSize() {

    const [size, setSize] = useState<Size>({ width: window.innerWidth, height: window.innerHeight })
    useEffect(() => {
        const onResize = () => {
            setSize({ width: window.innerWidth, height: window.innerHeight })
        }

        window.addEventListener("resize", onResize)
        return () => {
            window.removeEventListener("resize", onResize)
        }
    }, [])

    return size
}