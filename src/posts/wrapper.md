---
title: Creating a nice function wrapper + context manager
description: Making magic happen
author: ggoggam
date: 05/12/2024
published: false
categories:
  - Context Manager
  - Python
---

If you are a user of PyTorch, you surely have used a nice wrapper / context manager `torch.no_grad` or `torch.inference_mode` (for a more recent version of PyTorch) to make the inference more compute and memory efficient.
There is something very special about this API that not many people look into. 
First, it is both a context manager and a function wrapper, so it can be used in the following way:

```python
with torch.no_grad():
    ...

class Model:
    def __init__(self, *args, **kwargs):
        ...

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        ...

    @torch.no_grad()
    def infer(self, x: torch.Tensor) -> torch.Tensor:
        ...
```



