'use client'

import Giscus from "@giscus/react";

export default function Learned() {
    return <div className="flex flex-col py-4 space-y-4">
      <h3 className="text-4xl font-bold">learned</h3>
      <h4>Snippets of code with a dash of comments for personal notes</h4>
      <div className="comments-container">
        <Giscus
          id="comments"
          repo="ggoggam/ggoggam.github.io"
          repoId="720973405"
          mapping="specific"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme="light"
          loading="lazy"
        />
      </div>
      
    </div>
}