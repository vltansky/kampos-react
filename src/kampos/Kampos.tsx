import { useEffect, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { Kampos as KamposCore } from "kampos";

/*
 * Minimal, cross-browser logic for playing videos and making sure
 * they are ready to work with
 */
function prepareVideos(videos) {
  return new Promise((resolve) => {
    let playing = 0;
    let timeupdate = 0;

    function canPlay(e) {
      e.target.play();
    }

    const isPlaying = (e) => {
      playing += 1;
      e.target.removeEventListener("playing", isPlaying, true);
      check();
    };
    const isTimeupdate = (e) => {
      timeupdate += 1;
      e.target.removeEventListener("timeupdate", isTimeupdate, true);
      check();
    };

    const check = () => {
      if (playing === videos.length && timeupdate === videos.length) {
        videos.forEach((vid) => {
          vid.removeEventListener("canplay", canPlay, true);
        });

        resolve();
      }
    };

    videos.forEach((vid) => {
      vid.addEventListener("playing", isPlaying, true);
      vid.addEventListener("timeupdate", isTimeupdate, true);
      vid.addEventListener("canplay", canPlay, true);
    });
  });
}

/*
 * Most simple image loader
 * You'll probably have something like this already
 */
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      resolve(this);
    };

    img.src = src;
  });
}

type KamposCoreProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  effects?: any;
  noSource?: boolean;
};
type VideoSource =
  | {
      src: string;
      srcs?: never;
    }
  | {
      srcs: string[];
      src?: never;
    };
type KamposProps = {
  // TODO: (e: MouseEvent, target: HTMLCanvasElement) => void;
  mouseenter?: () => void;
  // TODO: (e: MouseEvent, target: HTMLCanvasElement) => void;
  mouseleave?: () => void;
  mousemove?: (e: MouseEvent, target: HTMLCanvasElement) => void;
  beforePlay?: (medias: HTMLVideoElement[]) => void;
} & VideoSource &
  KamposCoreProps;

export function Kampos({
  src,
  srcs,
  effects,
  beforePlay,
  mouseenter,
  mouseleave,
  mousemove,
}: KamposProps) {
  const srcArr = src ? [src] : srcs;
  const videosRef = useRef<HTMLVideoElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let mousemoveEnterListener: () => void;
    let mouseMoveLeaveListener: () => void;
    const target = canvasRef.current;
    const medias = videosRef.current;
    console.log(videosRef);

    if (target && medias) {
      const instance = new KamposCore({ target, effects });

      prepareVideos(medias).then(() => {
        const width = medias[0].videoWidth;
        const height = medias[0].videoHeight;
        instance.setSource({ media: medias[0], width, height });

        beforePlay?.(medias);
        instance.play();

        if (mouseenter) {
          target.addEventListener("mouseenter", mouseenter);
        }

        if (mouseleave) {
          target.addEventListener("mouseleave", mouseleave);
        }

        if (mousemove) {
          const mouseMoveFn = (e: MouseEvent) => mousemove(e, target);
          mousemoveEnterListener = () => {
            target.addEventListener("mousemove", mouseMoveFn);
          };
          mouseMoveLeaveListener = () => {
            target.removeEventListener("mousemove", mouseMoveFn);
          };
          target.addEventListener("mouseenter", mousemoveEnterListener);
          target.addEventListener("mouseleave", mouseMoveLeaveListener);
        }
      });
    }

    return () => {
      if (mouseenter) {
        target?.removeEventListener("mouseenter", mouseenter);
      }

      if (mouseleave) {
        target?.removeEventListener("mouseleave", mouseleave);
      }

      if (mousemoveEnterListener) {
        target?.removeEventListener("mouseenter", mousemoveEnterListener);
      }
      if (mouseMoveLeaveListener) {
        target?.removeEventListener("mouseleave", mouseMoveLeaveListener);
      }
    };
  }, [beforePlay, effects, mouseenter, mouseleave, mousemove]);

  return (
    <div>
      {srcArr?.map((src) => (
        <video
          key={src}
          ref={(ref) => {
            if (ref) {
              videosRef.current?.push(ref);
            }
          }}
          src={src}
          autoPlay
          loop
          muted
          preload="auto"
          crossOrigin="anonymous"
          playsInline
          style={{ display: "none" }}
        />
      ))}

      <canvas id="target" ref={canvasRef} />
    </div>
  );
}
