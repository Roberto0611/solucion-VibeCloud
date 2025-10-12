import { useState, useEffect } from 'react';

interface TypewriterProps {
    text: string;
    speed?: number;
}

const useTypewriter = (text: string, speed: number = 10) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setDisplayText(text.substring(0, i + 1));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, speed);

        return () => {
            clearInterval(typingInterval);
        };
    }, [text, speed]);

    return displayText;
};

const Typewriter = ({ text, speed }: TypewriterProps) => {
    const displayText = useTypewriter(text, speed);

    return <p>{displayText}</p>;
};

export default Typewriter;