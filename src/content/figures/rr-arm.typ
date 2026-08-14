#import "/src/typst/lib.typ": figure-page
#import "@preview/cetz:0.5.2"

#show: figure-page

#let q1 = 38deg
#let q2 = 48deg
#let l1 = 3.1
#let l2 = 2.3
#let j1 = (l1 * calc.cos(q1), l1 * calc.sin(q1))
#let j2 = (
  j1.at(0) + l2 * calc.cos(q1 + q2),
  j1.at(1) + l2 * calc.sin(q1 + q2),
)

#cetz.canvas(length: 8mm, {
  import cetz.draw: *

  set-style(stroke: (thickness: 0.7pt, paint: luma(35%)))

  line((-0.3, 0), (6.4, 0), mark: (end: "stealth"))
  line((0, -0.3), (0, 4.8), mark: (end: "stealth"))
  content((6.4, -0.28), [$x$])
  content((-0.28, 4.8), [$y$])

  line((0, 0), j1, stroke: 2.6pt + rgb("#2563eb"))
  line(j1, j2, stroke: 2.6pt + rgb("#0f766e"))

  circle((0, 0), radius: 0.13, fill: luma(20%), stroke: none)
  circle(j1, radius: 0.13, fill: white, stroke: 1.3pt + rgb("#2563eb"))
  circle(j2, radius: 0.13, fill: rgb("#0f766e"), stroke: none)

  content((j1.at(0) * 0.52, j1.at(1) * 0.52 - 0.32), [$l_1$])
  content(
    ((j1.at(0) + j2.at(0)) / 2, (j1.at(1) + j2.at(1)) / 2 + 0.32),
    [$l_2$],
  )
  content((j2.at(0) + 0.28, j2.at(1)), [$p=(x,y)$], anchor: "west")
  content((-0.15, -0.35), [$q_1$], anchor: "north")
  content((j1.at(0) + 0.2, j1.at(1) - 0.35), [$q_2$])
})
