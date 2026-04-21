import React from 'react'
import CenterCard from './CenterCard'

const CenterMiddle = ({ isDark }) => {
    const cardData = [
        {
            title: "Capture",
            desc : "Camera captures hand gestures and signs in real-time"
        },
        {
            title: "Process",
            desc : "AI model recognizes and interprets the sign language"
        },
        {
            title:"Output",
            desc: "Converts to text and speech for seamless communication"
        }]
    return (
        <div className='w-full h-80 p-10 flex justify-around items-center gap-8'>
            <div className='w-full h-70 p-8 rounded-2xl flex flex-col justify-start gap-4'
                style={{
                    background: isDark ? "rgba(255,255,255,0.08)" : "rgba(248, 250,255, 1) ", boxShadow: isDark
                        ? "0 8px 32px rgba(0,0,0,0.5)"
                        : "0 8px 32px rgba(31,38,135,0.3)"
                }}>
                <div className='flex items-center justify-start gap-1 w-full h-20'>
                    <div className='h-12 w-12 rounded-xl flex items-center justify-center'
                        style={{
                            background: isDark
                                ? "rgba(255,255,255,0.08)"
                                : "rgba(0, 0, 0, 1)",

                        }}>
                        <i className="ri-information-line text-3xl text-white"
                        ></i>
                    </div>
                    <h1 className='text-3xl p-4 text-white font-semibold' style={{ color: isDark ? 'white' : 'black' }}>How It Works</h1>
                </div>

                <div className='flex flex-wrap items-start justify-between gap-4'>
                    {cardData.map((card, index) => (
                        <CenterCard key={index} index={index} title={card.title} desc={card.desc} isDark={isDark} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CenterMiddle
