export default function About() {
  return (
    <article className="about">
      <span className="eyebrow">ABOUT THE PROJECT</span>
      <h1>A clearer view of the economy.</h1>
      <p className="about-lead">
        EconLens is an independent educational and data visualization project
        designed to make economic indicators easier to explore and understand.
      </p>
      {[
        {
          title: "Purpose",
          text: "Bring country-level economic indicators into one readable research workspace. Explore the overview, dedicated indicator views, and comparisons of two to five countries.",
        },
        {
          title: "Data sources",
          text: "Data comes from the World Bank’s World Development Indicators API and the OECD Average Annual Wages dataset. Original compilers include national statistical agencies, the IMF, and the ILO. Each chart links to its original provider.",
        },
        {
          title: "Methodology",
          text: "The dashboard uses annual provider observations without interpolation. KPI values are the latest non-null observation for each indicator. Percentage-series changes are percentage points; other changes are in the original unit. Time windows end at each series’ latest observation. World Bank requests are cached for six hours; OECD wages for 24 hours. Successful browser requests are reused for five minutes.",
        },
        {
          title: "Limitations",
          text: "Economic datasets are updated at different intervals, revised retrospectively, and may have different latest available years. Unemployment is a modeled ILO estimate. GDP per capita is in current US dollars, not a measure adjusted for inflation or purchasing power. Missing data is never replaced by zero. Gini observations come from surveys of income or consumption; methodology and coverage can differ. Wages use gross full-time-equivalent OECD means in constant PPP-adjusted US dollars, with the provider price-base year. They do not represent median earnings or take-home pay.",
        },
      ].map((s) => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          <p>{s.text}</p>
        </section>
      ))}
      <section>
        <h2>Use responsibly</h2>
        <p>
          EconLens does not provide financial advice. Verify data with the
          original provider for serious research.
        </p>
        <a href="https://data.worldbank.org/" target="_blank" rel="noreferrer">
          Explore World Bank Open Data ↗
        </a>
      </section>
      <section>
        <h2>Built by Yunseong Kim</h2>
        <a href="https://yunseong-kim.vercel.app/">Portfolio ↗</a>
      </section>
    </article>
  );
}
