---
title: GFlowNets
description: If deep learning and MCMC had a baby
author: ggoggam
date: 03/06/2024
published: false
categories:
  - Deep Learning
  - AI
  - GFlowNet
---

A co-worker of mine in the lab recently introduced me to a framework[^1], and I am truly excited about what it brings to the research scene in artificial intelligence.
The novel framework is called GFlowNets (short for **G**enerative **Flow** **Net**works), which can be thought of as an extension of reinforcement learning (RL).
The main objective of interest is to sample a compositional object, i.e. objects that can be built by taking a series of sequential steps, from a multi-modal distribution in such a way that the samples are rewarding.

As opposed to conventional RL methods, GFlowNets hold several advantages. The most notable among them is the diversity of high-reward samples. 
In conventional RL, the reward-maximizing (or mode-seeking) behavior of policies often result in mode-collapse, resulting in high reward samples from only few modes in the sample distribution.
With this in mind, GFlowNets can be applied to tasks that require creativity, where novel yet rewarding samples are desirable. One such application is molecule generation (possible for drug discovery), which is explored in the seminal paper[^2].

## Main Idea
The main idea behind GFlowNets is to learn a policy that can create an object 


## Preliminaries
We define a Markov Decision Process (MDP) as a tuple $\langle S, A, f, r, \rho_0 \rangle$, where $S$ is the state space, $A$ the action space, $f: S \to S$ transition, $r$ reward, and $\rho_0$ the initial distribution of states.
The 



```math
L(s) = \sum_{i=0}^n a_i \prod_{j \geq 0} t_j
```

[^1]: Bengio et al., GFlowNet Foundations. https://arxiv.org/pdf/2111.09266
[^2]: Bengio et al., Flow Network based Generative Models for Non-Iterative Diverse Candidate Generation. https://arxiv.org/pdf/2106.04399