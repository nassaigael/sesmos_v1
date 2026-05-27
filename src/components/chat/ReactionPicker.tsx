import React from 'react';

interface ReactionPickerProps {
    onSelect: (reaction: string) => void;
    onClose: () => void;
}

const REACTIONS = [
    { emoji: '👍', type: 'thumbs_up' },
    { emoji: '👎', type: 'thumbs_down' },
    { emoji: '❤️', type: 'heart' },
    { emoji: '✅', type: 'check' },
    { emoji: '❌', type: 'cross' },
];

const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect, onClose }) => {
    return (
        <div className="absolute bottom-full mb-2 bg-white rounded-xl shadow-lg border p-2 z-50">
            <div className="flex gap-1">
                {REACTIONS.map((reaction) => (
                    <button
                        key={reaction.type}
                        onClick={() => {
                            console.log('🎯 Reaction clicked:', reaction.type);
                            onSelect(reaction.type);
                            onClose();
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-xl"
                    >
                        {reaction.emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ReactionPicker;