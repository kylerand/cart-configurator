# 2D Configurator Assets

Place layered transparent WebP/PNG images here for the 2D image compositor.

## Naming Convention

```
{optionId}-cart-{view}-{layer}.webp
```

- **optionId**: The option's unique ID from the catalog
- **view**: `front`, `rear`, or `interior`
- **layer**: The image layer slot (`body`, `wheels`, `roof`, `seats`, `accessories`, `storage`, `audio`, `dash`)

## Background Images

```
background-front.webp
background-rear.webp
background-interior.webp
```

## Category-to-Layer Mapping

| Option Category | Layer Slot | Best View |
|---|---|---|
| WHEELS | wheels | front |
| ROOF | roof | front |
| SEATING | seats | interior |
| STORAGE | storage | rear |
| LIGHTING | accessories | front |
| ELECTRONICS | audio | interior |
| SUSPENSION | body | front |
| FABRICATION | accessories | rear |

## Image Requirements

- **Format**: WebP preferred (PNG fallback)
- **Transparency**: All layers except background must have transparent backgrounds
- **Size**: Consistent dimensions across all images (recommended: 1200×800)
- **Quality**: Optimized for web (aim for < 100KB per layer)

## Example

For a wheel option with ID `wheel-chrome-20`:
```
wheel-chrome-20-cart-front-wheels.webp
wheel-chrome-20-cart-rear-wheels.webp
```
