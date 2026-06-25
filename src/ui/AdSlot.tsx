// Reserved advertising space (Google AdSense).
//
// The slot is always present in the layout so the design accounts for it. To go
// live: add the AdSense loader script to index.html, then replace the
// placeholder below with your unit, e.g.
//
//   <ins className="adsbygoogle" style={{ display: "block" }}
//        data-ad-client="ca-pub-XXXXXXXX" data-ad-slot="NNNNNN"
//        data-ad-format="auto" data-full-width-responsive="true" />
//   // and call (window.adsbygoogle = window.adsbygoogle || []).push({})
//
// Flip SHOW_AD_SLOT to false to hide it entirely (e.g. for screenshots).

const SHOW_AD_SLOT = true;

export function AdSlot() {
  if (!SHOW_AD_SLOT) return null;
  return (
    <aside className="ad-slot" aria-label="Advertisement">
      <span className="ad-slot__tag">Advertisement</span>
      <div className="ad-slot__inner">Ad space</div>
    </aside>
  );
}
