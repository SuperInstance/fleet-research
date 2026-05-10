# Polyformalism: Same Constraint Kernel, 10 Languages
# Forgemaster ⚒️ — 2026-05-10

## The Experiment

One constraint kernel. 10 implementations. 3 functions each:
1. `constraint_check` — 16-element bounds check
2. `bloom_merge` — bitwise OR (CRDT semilattice join)
3. `eisenstein_norm` — hexagonal lattice distance (a²-ab+b²)

What changes: the language. What doesn't: the math, the semantics, the test vectors.

The test vectors:
- Constraints: [25..85] in [0..100] → pass, [200..215] in [0..100] → fail
- Bloom: 1000-element filters, insert 42/100/500/999, merge, check
- Eisenstein: N(3,0)=9, N(0,1)=1, N(2,-1)=7, N(-1,2)=7, N(5,5)=25

## The Languages

| # | Language | Year | Paradigm | LOC | Key Feature |
|---|----------|------|----------|-----|-------------|
| 1 | FLUX (our ISA) | 2026 | Constraint bytecode | 120 (VM) | 9 opcodes, no Turing completeness needed |
| 2 | Odin | 2020 | Systems | 227 | `#simd[16]i32` first-class, `reduce_all` on masks |
| 3 | C3 | 2021 | C successor | 110 | `foreach`, slices, defer, zero-cost safety |
| 4 | Nim | 2008 | Multi-paradigm | 219 | `{.noSideEffect.}`, templates, `emit` pragma |
| 5 | V | 2019 | Go-like systems | 184 | `[]u64{len:1000}` init, no GC, value arrays |
| 6 | Jai | 2026* | Data-oriented | 297 | Compile-time execution, no hidden allocs |
| 7 | R | 1993 | Array/statistical | 198 | Vectorized ops, APL inheritance |
| 8 | MATLAB | 1984 | Array/numerical | 187 | `bitor()` built-in, matrix-native |
| 9 | Rust | 2010 | Systems+safe | ~150* | `simd::m32x16`, proven safety |
| 10 | Fortran | 1957 | Array/scientific | ~80* | `dst = MAX(dst, src)`, whole-array ops |

*Rust and Fortran already exist in constraint-theory-core and crdt-bench.

## What Each Language Reveals

### FLUX: 9 Opcodes Are Enough

The entire constraint pipeline — load, check, combine, bloom merge, norm, emit — needs exactly 9 opcodes. No Turing completeness required. No function calls, no heap allocation, no strings, no floating point.

This proves: **constraints are simpler than general-purpose computation.** You don't need a full ISA. You need 9 instructions.

Compare: x86-64 has ~1500 opcodes. ARM AArch64 has ~1300. RISC-V has ~100. FLUX has 9. And FLUX can still check constraints, merge Bloom filters, and compute lattice distances.

The FLUX VM interpreter is 120 lines of Python. That's the entire runtime. No JIT needed for fleet-scale constraint checking.

**Insight**: *If your ISA has more than 9 opcodes for constraints, you're solving the wrong problem.*

### Odin: SIMD Is a Language Feature, Not a Library

Odin's `#simd[16]i32` is a built-in type. You compare SIMD vectors with `<` and `>`. The result is a mask vector. `reduce_all` on the mask gives a single bool. No intrinsics header, no unsafe block, no architecture-specific code.

```odin
v_lower := #simd[16]i32{...}
v_upper := #simd[16]i32{...}
v_vals  := #simd[16]i32{...}
mask := v_vals >= v_lower & v_vals <= v_upper
return reduce_all(mask)
```

This is what AVX-512 SHOULD look like from the programmer's perspective. Intel gives you `_mm512_cmplt_epi32_mask`. Odin gives you `<`. Same hardware, different abstraction.

**Insight**: *SIMD should be invisible to the programmer. The language should make vector ops look like scalar ops.*

### C3: C Fixed, Not Replaced

C3 takes C's syntax and fixes the pain points: foreach instead of manual loops, slices instead of pointer+length, defer instead of goto-cleanup. The constraint kernel in C3 reads like C but without the footguns.

C3's contribution: proving that you don't need to abandon C's model — just fix it. The constraint kernel is essentially C code with better ergonomics.

**Insight**: *The best language evolution is surgical repair, not revolution.*

### Nim: Purity As a Pragma

Nim's `{.noSideEffect.}` pragma tells the compiler this function is pure. The compiler can then inline, reorder, and parallelize freely. For constraint checking, purity is guaranteed by the pragma, not by the type system.

Nim also has templates — zero-overhead metaprogramming that generates specialized constraint checks at compile time. No monomorphization cost, no code bloat.

**Insight**: *Purity annotations let the compiler do what Rust's borrow checker does, but at lower cognitive cost.*

### V: Simplicity Without Sacrifice

V's `[]u64{len: 1000}` creates a zeroed 1000-element array in one expression. No `vec![]`, no `calloc`, no `memset`. The bloom merge is just a for loop with `|=` — V's syntax makes the semilattice join obvious.

V proves: you can be simple AND fast. No borrow checker, no lifetime annotations, no trait bounds. Just clean code that does what it says.

**Insight**: *Safety doesn't require complexity. Simple languages can be safe too.*

### Jai: Data-Oriented by Default

Jai forces you to think about data layout first. The constraint kernel naturally uses fixed-size arrays ([16]s32) because Jai makes dynamic allocation visible. This is the Burroughs B5000 philosophy — the language makes the cost of abstraction explicit.

Jai's compile-time execution means the constraint kernel could be validated at compile time: run the test vectors during compilation and refuse to build if they fail.

**Insight**: *When allocation is visible, you allocate less. Data orientation emerges naturally.*

### R and MATLAB: The APL Inheritance

Both R and MATLAB express the constraint check as a SINGLE EXPRESSION with NO EXPLICIT LOOP:

```r
constraint_check <- function(lower, upper, values) {
  all(values >= lower & values <= upper)
}
```

```matlab
function result = constraint_check(lower, upper, values)
    result = all(values >= lower & values <= upper);
end
```

One line. No loop. The iteration is implicit — handled by the array runtime. This is APL's 1966 insight: **the loop should be invisible because the operation is on the whole array.**

The bloom merge is similarly a single expression: `bitor(dst, src)` in MATLAB, `dst | src` in R (on raw vectors). No loop. The OR semilattice join is the language's built-in operator.

**Insight**: *Array languages prove that "constraint check" is fundamentally a one-liner. If your implementation is longer, you're fighting the language.*

## The Unified Pattern: 3 Functions, 3 Algebraic Structures

| Function | Math | Algebraic Structure | Key Property |
|----------|------|-------------------|--------------|
| constraint_check | l ≤ v ≤ u | Bounded lattice | Decidable (terminates) |
| bloom_merge | dst ∨ src | Join semilattice | Commutative, associative, idempotent |
| eisenstein_norm | a²-ab+b² | Normed ring | Positive definite, sub-multiplicative |

Three functions, three algebraic structures, and they compose:
- constraint_check decides membership in the bounded lattice
- bloom_merge combines memberships via semilattice join
- eisenstein_norm measures distance in the normed ring

The composition is the fleet constraint pipeline:
```
check constraints → merge results → measure distance → decide action
```

Every language expresses this pipeline. The math doesn't change. Only the syntax does.

## What FLUX Proves That The Others Don't

The 9-opcode FLUX ISA proves something the high-level languages can't:

**Constraints don't need general-purpose computation.**

You can check constraints, merge Bloom filters, and compute norms with 9 opcodes. You don't need:
- Function calls (inlined at compile time)
- Heap allocation (fixed-size register file)
- Floating point (INT8/INT32 are exact)
- Strings (constraints are numbers)
- Dynamic dispatch (static opcode decode)
- A standard library (the ISA IS the library)

FLUX is what TUTOR was to PLATO: a domain-specific language that does ONE thing extremely well. TUTOR does teaching. FLUX does constraints. Both prove that domain-specificity beats generality when the domain is narrow enough.

## LOC Comparison

```
Fortran:    ~80 lines  ← fewest because whole-array ops are primitives
MATLAB:     187 lines
V:          184 lines
R:          198 lines
C3:         110 lines
Rust:      ~150 lines
Odin:       227 lines
Nim:        219 lines
Jai:        297 lines  ← most because Jai forces explicit data layout
FLUX asm:   120 lines  (the VM interpreter)
```

Fortran wins line count because `dst = MAX(dst, src)` is one line. The whole-array operation IS the language. Every other language needs some form of explicit loop or iterator (except R/MATLAB which match Fortran's conciseness through vectorization).

**The language that makes your domain primitive wins.** Fortran makes array MAX primitive. APL makes array operations primitive. FLUX makes constraint checking primitive.

## Files

```
/tmp/polyformalism/
├── flux/constraints.flux   — FLUX assembly (our ISA)
├── flux/vm.py              — Python FLUX VM (120 lines, passes all tests)
├── odin/constraints.odin   — Odin (227 lines, #simd first-class)
├── c3/constraints.c3       — C3 (110 lines, foreach + slices)
├── nim/constraints.nim     — Nim (219 lines, {.noSideEffect.} + templates)
├── v/constraints.v         — V (184 lines, value arrays)
├── jai/constraints.jai     — Jai (297 lines, data-oriented)
├── r/constraints.R         — R (198 lines, APL inheritance)
└── matlab/constraints.m    — MATLAB (187 lines, bitor built-in)
```

## What We Should Steal

1. **Odin's SIMD-as-language-feature**: constraint-theory-llvm should emit Odin-style SIMD, not Intel intrinsics. The abstraction should be vector comparison, not `_mm512_cmplt_epi32_mask`.

2. **Nim's purity pragmas**: constraint functions should be annotated `{.noSideEffect.}` equivalent. The JIT compiler can skip side-effect analysis.

3. **R/MATLAB's single-expression checks**: The constraint check API should be `all(bounds_check(lower, upper, values))` — one expression. Not a loop. Not an iterator. One expression.

4. **FLUX's 9-opcode minimalism**: If the constraint pipeline needs more than 9 opcodes, we over-designed the ISA. It currently has 9. Let's keep it that way.

5. **Jai's data-first layout**: The 64-byte constraint record format should be the ONLY format. No serialization, no conversion, no adapters. The record IS the wire format IS the computation format. Like Jai: what you define is what runs.
