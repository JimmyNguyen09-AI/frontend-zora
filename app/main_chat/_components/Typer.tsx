'use client';

import { Typewriter } from 'react-simple-typewriter';
interface TypingWord {
    words: string[];
}

export default function TypingTitle({ words }: TypingWord) {
    return (
        <h2 className="text-center text-xl md:text-2xl font-semibold text-white mb-5">
            {' '}
            <span className="text-black dark:text-white">
                <Typewriter
                    words={words}
                    loop={0}
                    cursor
                    cursorStyle="|"
                    typeSpeed={70}
                    deleteSpeed={50}
                    delaySpeed={1500}
                />
            </span>
        </h2>
    );
}
