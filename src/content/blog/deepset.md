---
title: Deep Sets (NeurIPS 2017)
pubDate: 11/20/2023 14:25
author: "Ggoggam"
tags:
  - DL
  - Deep Sets
imgUrl: '../../assets/deepset.png'
description: How do we represent and learn sets with deep learning?
layout: '../../layouts/BlogPost.astro'
---
## Introduction 
Deep sets[^1] was one of the earliest work that proposed a fundamental neural network architecture to deal with sets as inputs. 
Mappings that take set itself as an input may exhibit either of the two main properties, namely **permutation invariance** and **permutation equivariance**. 

## Definition
We consider a power set $2^\mathcal{X}$ of some set $\mathcal{X}$ with some permutation $\pi$ that acts on the elements of $\mathcal{X}$. Given that the label space $\mathcal{Y}$ can either be discrete (i.e. classification) or continuous (i.e. regression), a function on set $f: 2^\mathcal{X} \to \mathcal{Y}$ is said to be **permutation invariant** if and only if $f(\{x_1, \dots, x_n\}) = f(\{x_{\pi(1)}, \dots, x_{\pi(n)}\})$, $\forall \pi$. On the other hand, in a transductive setting, a vector function $\mathbf{f}: \mathcal{X}^n \to \mathcal{Y}^n$ is said to be permutation equivariant if and only if $\mathbf{f}([x_{\pi(1)}, \dots, x_{\pi(n)}]) = [f_{\pi(1)}(\mathbf{x}), \dots, f_{\pi(n)}(\mathbf{x})]$


[^1]: Manzil Zaheer, Satwik Kottur, Siamak Ravanbakhsh, Barnabas Poczos, Russ R. Salakhutdinov, Alexander J. Smola, *Deep Sets*, NeurIPS 2017