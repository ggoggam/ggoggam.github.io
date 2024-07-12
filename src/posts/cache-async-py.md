---
title: A quick note on async cache
description: Implementing async cache decorator
author: ggoggam
date: 07/01/2024
published: true
categories:
  - Cache
  - Python
  - Concurrency
---

Async programming is crucial in making responsive and scalable web applications.
In python, it is usually done with `asyncio`, allowing developers to write concurrent, suspendable (non-blocking) code with ease.
However, there are times where we need to cache the output of the result of async functions.
In synchronous python, it is usually done with cache implementations such as LRU (Least Recently Used) cache in `functools` package, but it is not applicable to async functions since they return coroutine, not function outputs. Hence we need to implement a cache, preferably in the form of decorator for a concise code.

## Defining LRU cache
In order to do this, we shall first define a key that will be used to identify arguments to a function. 
Note that it should be **hashable** so that it can be stored as a key in a dictionary (hash map).
We will focus on implementing LRU cache, which is basic yet one of most commonly used caching algorithm, notably in memory paging. 

```python
class HashableKey:
    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        self.kwargs.pop("use_cache", None)

    def __eq__(self, other: Any) -> bool:
        return hash(self) == hash(other)
    
    def __hash__(self) -> int:
        def _hash(param: Any):
            if isinstance(param, tuple):
                return tuple(map(_hash, param))
            if isinstance(param, dict):
                return tuple(map(_hash, param.items()))
            if hasattr(param, "__dict__"):
                return str(vars(param))
            return str(param)
        return hash(_hash(self.args) + _hash(self.kwargs))
```

Then we can implement LRU cache.

```python
class LeastRecentlyUsedCache(OrderedDict):
    def __init__(self, max_size: Optional[int] = None, *args, **kwargs):
        self.max_size = max_size
        super().__init__(*args, **kwargs)
    
    def __getitem__(self, key: Any) -> Any:
        value = super().__getitem__(key)
        self.move_to_end(key)
        return value
    
    def __setitem__(self, key: Any, value: Any):
        super().__setitem__(key, value)
        if self.max_size and len(self) > self.max_size:
            # pop the least recently used result
            oldest = next(iter(self))
            del self[oldest]
```



## Defining TTL cache

To define a time-to-live (TTL) cache, one can extend LRU to check for expiration of the cached results.
```python
class TimeToLiveCache(LeastRecentlyUsedCache):
    def __init__(
        self, ttl: Optional[int] = None, max_size: Optional[int] = None
    ) -> None:
        super().__init__(max_size=max_size)

        self.ttl = datetime.timedelta(seconds=ttl) if ttl else None

    def __contains__(self, key: Any) -> bool:
        if key not in self.keys():
            return False
        expiration = super().__getitem__(key)[1]
        if expiration and expiration < datetime.datetime.now():
            del self[key]
            return False
        return True

    def __getitem__(self, key: Any) -> Any:
        value = super().__getitem__(key)[0]
        return value

    def __setitem__(self, key: Any, value: Any) -> None:
        ttl = (datetime.datetime.now() + self.ttl) if self.ttl else None
        super().__setitem__(key, (value, ttl))
```

## Defining a wrapper
For a wrapper (decorator), we can define the following wrapper class using the aforementioned key and the cache implementations. 

```python
class async_lru_cache:
    def __init__(self, max_size: int = 128):
        self.lru = LeastRecentlyUsedCache(max_size=max_size)

    def __call__(self, func):
        async def wrapper(*args, **kwargs):
            key = HashableKey(*args, **kwargs)
            if key in self.lru:
                return self.lru[key]
            self.lru[key] = await func(*args, **kwargs)
            return self.lru[key]
        return wrapper        
```
The wrapper for TTL can be written in a similar way, replace `self.lru` with an instance of TTL cache defined above.
Now, we can use this with an asynchronous function.

```python
class UserService:
    def __init__(self):
        ...

    @async_lru_cache()
    def get_user(self, id: int) -> User:
        ...
```