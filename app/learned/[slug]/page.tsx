import Giscus from "@giscus/react";

export default function NotePage() {
    return (
        <div className="comments-container">
            <Giscus
                id="comments"
                repo="ggoggam/ggoggam.github.io"
                repoId="R_kgDOKvkuXQ"
                category="General"
                categoryId="DIC_kwDOKvkuXc4Cjadh"
                mapping="pathname"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="bottom"
                theme="light_tritanopia"
                loading="lazy"
            />
      </div>
    )
}