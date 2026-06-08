# Ad Research Report Template

The master markdown the pipeline writes. Output file naming pattern: `{campaign-slug}-ad-research-{YYYY-MM-DD}.md`, placed at the user-specified report path.

Use {curly-braces} for variables the pipeline fills, [square-brackets] for prose guidance.

```template
# Ad Research Report — {business-name}

- Date: {YYYY-MM-DD}
- Keywords searched: {keyword-list}
- Media type: {image | video}
- Minimum run time: {N} months
- Ads pulled: {count}
- Source: Meta Ad Library via Apify (brilliant_gum/facebook-ads-library-scraper)

## Winning Ads (sorted shortest-running to longest)

| # | Advertiser / Page | Page link | Ad Library | Run time | Engagement | Media | Landing URL |
|---|-------------------|-----------|-----------|----------|-----------|-------|-------------|
| 1 | {advertiser} | {page-url} | {ad-library-url} | {run-days} | {engagement} | {media} | {url} |
| ... | | | | | | | |

### Pulled Ad Copy

[For each winning ad, the full ad copy verbatim, labeled by its row number above, tagged with who ran it.]

#### Ad {n} — {advertiser}
- Page: [{advertiser}]({page-url})
- Ad Library: {ad-library-url} (archive ID {ad-archive-id})

{ad-copy}

---

## Creative Brief

- Ad type / angle: {ad-type-and-angle}
- Primary CTA: {single-cta}
- What the offer does: {exact-offer}

---

## Generated Variations

[At least 5. Each variation is a copy + prompt pair, format {aspect-ratio}.]

### Variation {n}
**Copy:**
{ad-text-copy}

**{Image | Video} prompt ({aspect-ratio}):**
{generation-prompt}
```

## Field Documentation

| Field | Meaning |
|-------|---------|
| `business-name` | From brand scope |
| `advertiser` | The page/brand running the ad |
| `page-url` | The advertiser's Facebook/Instagram page link |
| `ad-library-url` | Permalink to the ad's Meta Ad Library snapshot |
| `ad-archive-id` | The ad's archive ID from the library |
| `keyword-list` | The agreed search terms |
| `run-days` | Computed run time from the actor |
| `engagement` | Engagement signal used to rank |
| `single-cta` | The one primary CTA from the CMO brief |
| `exact-offer` | The concrete outcome the customer gets |
| `aspect-ratio` | 1:1, 4:5, or video |

## Section Specifications
- **Winning Ads** — table sorted least-to-longest run duration; one row per kept ad.
- **Pulled Ad Copy** — verbatim copy for each ad, matched to the table row.
- **Creative Brief** — exactly three fields; CTA must be singular.
- **Generated Variations** — appended at the bottom, 5+ pairs, each prompt aligned to its copy.
