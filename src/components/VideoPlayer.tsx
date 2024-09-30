import React from 'react'

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  return (
    <div className="relative w-full aspect-w-16 aspect-h-9">
      <iframe
        src={videoUrl}
        title="Lesson Video"
        className="absolute inset-0 w-full h-full"
        allowFullScreen
      />
    </div>
  )
}

export default VideoPlayer
