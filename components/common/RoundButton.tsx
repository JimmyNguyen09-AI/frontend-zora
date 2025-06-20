import React from 'react'

interface RoundButtonProps {
    onClick: () => void;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const RoundButton: React.FC<RoundButtonProps> = ({ onClick, Icon }) => {
    return (
        <button
            onClick={onClick}
            className="text-black dark:text-white border border-black/20 dark:border-white/20 
             hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer
             rounded-full w-9 h-9 inline-flex items-center justify-center ml-2 mb-2 md:mb-0"
        >
            <Icon className="w-5 h-5" />
        </button>
    );
};

export default RoundButton;
