export default function ProgressiveBlur() {
  return (
    <>
      <div className="progressive-blur top-blur" aria-hidden="true">
        <div className="layer blur-1" />
        <div className="layer blur-2" />
        <div className="layer blur-3" />
        <div className="layer blur-4" />
        <div className="layer blur-5" />
        <div className="layer blur-6" />
        <div className="layer blur-7" />
        <div className="layer blur-8" />
      </div>
      <div className="progressive-blur bottom-blur" aria-hidden="true">
        <div className="layer blur-1" />
        <div className="layer blur-2" />
        <div className="layer blur-3" />
        <div className="layer blur-4" />
        <div className="layer blur-5" />
        <div className="layer blur-6" />
        <div className="layer blur-7" />
        <div className="layer blur-8" />
      </div>
    </>
  );
}
