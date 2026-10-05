# Product photos on Recommended

Where the photos on Figma 09 and 10 come from, and how they map to the catalogue.

## Source

The PMs supplied a Drive folder of 28 photos alongside
`Bump_to_Bloom_0_to_24_Month_Product_Recommendations_image.xlsx`. The photo
filenames match the sheet's **Product Type** column, and the sheet's "Ssearch
Product Image" tab lists those same 28 types with an example brand and
free-stock search links.

The supplied folder now covers all sixteen products in the current catalogue.
The seven feeding, sleep and everyday-care photos are the JPGs supplied with
the follow-up image bundle. The emoji remains a safe fallback for any future
catalogue row without an approved photo.

The original catalogue photos live in `apps/web/public/products/` as webp, with
a short edge of 800, a long edge capped at 1200, and quality 82. The seven
follow-up photos are supplied as JPGs. Every image is under 100 KB.

## Mapping

Photos were matched on what the image actually shows, not on its filename.
Several files in the folder are mislabelled: the one named `soft-toddler-ball`
is a photograph of a playpen, and the one named `large-peg-spin-toy` is a
toddler playing with plain wooden blocks.

| Product | File | Drive source | Note |
| --- | --- | --- | --- |
| High-Contrast Black & White Art Cards | `high-contrast-art-cards.webp` | High-Contrast Baby Cards | |
| Inflatable Tummy Time Water Mat | `tummy-time-water-mat.webp` | Tummy-Time Play Mat | Loose. The photo is a play gym, not a water mat. |
| 100% Food-Grade Silicone Baby Teether | `silicone-teether.webp` | Silicone Teether | |
| Textured Sensory Rattle Ball | `textured-rattle-ball.webp` | Easy-Grasp Ball | |
| Soft Fabric Crinkle Peek-a-Boo Book | `crinkle-peekaboo-book.webp` | Touch-and-Feel Board Book | Loose. The photo is a board book, not a fabric book. |
| Shape Sorting Cube & Stacking Rings | `shape-sorting-stacker.webp` | Ring Stacker | Covers the stacking rings half of the name only. |
| Large Wooden Building Blocks Set (30 pcs) | `wooden-building-blocks.webp` | large-peg-spin-toy (wooden blocks) | Judgement call. The file named Large Building Blocks is plastic MEGA BLOKS; our product says wooden. Swap the two if Product prefers the labelled file. |
| Toddler Balance Bike | `toddler-balance-bike.webp` | Toddler Balance Bike | |
| First Words Chunky Board Books Set | `first-words-board-books.webp` | First Words Board Book | Source is only 278x327, so the detail hero is soft. A larger file would help. |

## Follow-up photos

These seven JPGs were supplied in the follow-up image bundle and are mapped in
`apps/web/src/lib/api/recommendations.ts`:

1. Sound Machine with Constant White Noise -> `sound_machine.jpg`
2. Organic Cotton Muslin Burp Cloths (4-Pack) -> `muslin_burp_cloth.jpg`
3. Ergonomic Silicone Starter Spoon Set -> `starter_spoon_set.jpg`
4. Weighted Straw Silicone Open/Trainer Cup -> `trainer_cup.jpg`
5. Wooden Push Walker & Activity Center -> `push_walker.jpg`
6. Silicone Suction Divided Plate with Grip -> `plate.jpg`
7. Non-Slip Toddler Step Stool -> `toddler_step_stool.jpg`

## When the catalogue moves to the database

`imageUrl` is set on the mock rows in `apps/web/src/lib/api/recommendations.ts`.
The `products` table already has an `image_path` column (0001) which 0009 seeds
as null for every row. When #225 builds products from DB rows, put these same
`/products/<slug>.webp` paths in `image_path` and the component needs no change.
