interface EpisodeTitleProps {
  episodeId: string
  chapterTitle: string
}

export function EpisodeTitle({ episodeId, chapterTitle }: EpisodeTitleProps) {
  const epNumber = episodeId.split('-')[0].replace('ep', 'EPISODE ')
  
  return (
    <div className="flex flex-col mb-8 text-center border-b border-border/30 pb-8">
      <span className="text-xs font-mono text-secondary tracking-[0.3em] uppercase mb-2">
        {epNumber}
      </span>
      <h1 className="text-3xl md:text-4xl font-serif text-primary tracking-wide">
        {chapterTitle}
      </h1>
    </div>
  )
}
