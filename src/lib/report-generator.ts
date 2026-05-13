import type { StatementIntelligence } from "@/lib/statement-engine";

const LOGO_B64 = "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lyv0D9ti1qIIiIAIiIAIiEAHgbok9I6w9VUEREAEREAERKCdgBJ6Ow0ti4AIiIAIiEBNCSih17TjFLYIiIAIiIAItBNQQm+noWUREAEREAERqCkBJfSadpzCFgEREAEREIF2Akro7TS0LAIiIAIiIAI1JVCX59AnwfemhIw/SOirpytecfgFKlyJTNezojaKgAiIgAiEIHAtz7mvH8JQahu1SOjAfRww66SGUxF/DxCHJfQ5KxKPwhABERCBJhM4p8mNU9tEQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREID2BUeldFvfI/wSfDa2fFdfM1LiAf8d6a+aWGq6EzRGE/X8ChH4rXC4IYEcmREAEREAERCCbAElrYSRUaVIy3z0UFOycnE1fa0VABERABOpA4GN1CDJwjJ8hea0Y2GZZ5vYry7H8ioAIiIAIVIvAICZ064F9q9UNxaPhpGRttJYqrikNERABERCBJhIY1IS+Mwlxjpp36N41j1/hi4AIiIAIBCQwqAndEH4rIMekpjgZWQiHWyZ1KmciIAIiIAKVJjDICb3OV7jfrvRepeBEQAREQASSExjkhD4vV7pbJycexuEeYczIigiIgAiIQFMIDHJCtz6s3VU6JyG7EXfd7/835fejdoiACIhAZQhMW5lIyglkTRLkirxQ5b5y3Dt5jTVDvxYvGXIiJiUREIGuBDgGfpaN63etkH/DOxxLj8lfPU5N2rMFlpf3tP4QbfmLp43k6oOe0A34Pohd9Va+sKOuSZDLRgr0w0h2ZVYERKDaBF4lvJ+GCJFj1FUkwsdC2PKwcRK6c3vom+qOnvqlqCuhTzPNruyE/8FO+EYpPVDM6XeLVW9+bfpuRlq5HDIXMkub/DvLE9vkLZbH089P86mSkwB87cA4D2Kf8w4t2y2f1ojOeyzfg4yD7dt8DmyB1YI0fnFkdqS1L87MsrF6B2ntj2+y/GBVeBHHk8R+HTGth/iWnTFwkK8RV33a8RV0fZP56zA52zWGMvWU0P9F/xt8HFZmR/TzPXSw2KpfvaZvh8O6tPGLyAqIJfJFkNwF/clUfhh5CLHXAF/Gj/cVPitbiNl3SHQSbTwyTwPxtQD1vobYEOw6yAxIroLu81S05H4HciU+63QrK1cbW5Vo66wsW/JojZrZyNlsre15PrHxEvUeRO5HroGXJdWyil3VhkjoO2GntISO7zGIbznO14D0exBgxw/5LnfMjSgv9HBfiU1E/IsRUYddUdl3udPMrZHzkXfCNnmKtTtY+gmyeCU6uyMI4tp/SqRuCy93mBzxFbOLIqe6me+q9RRbLHZLfrUvtGN+ZD/keiRGsf37HKSUE3f8vhKoUSFODArvL8Q+e4D438fGnIWdSyE/AQDHTui2H9hEisoW4nvNgoxYKpfQaevXkWcjtjnL9OmsXLRKOwLxREvo2F4E+QMSs0zG+GFI7qv9ivH/FLGHPtnpx/s5Kli/z5SKBb5+1i+onNvPSBVzux9i+07O+HpVO6HdppYjEID+Qr16INC2sRFCD2KS9u0cqI29zNiQWyUKQW6L/LNXsAm2/R4fdk+09EIcURI6dn+ZgGO7ixf5YsPUtSjEugRySXsDSlieiM9DkOliQ8PHgoHaZydwyU5EWlzweXeA+Cs5StdqY7/Pj/WrUJHtrQk4McNZm51h+ZgOPGzHelStPaQUjNv9jViG/yeRG9lwLlL2D8vmVTxBPCnYj2ARcwVtWhaxOQQHxvSTYXt+1l2G76MytlVqFTEeTECPI18tOTCbVPdj5EFisvv10Qr38O3W48UBHEyPjaSvpobNMvhc2TP2i2HwpKeNUtXrktBTQdo7laO8fthRbULUinnr17Ue7fwJsT+BrFOhNtgQ8dHEdg/y6QrF5RwK7fgSyrchdgAsq9h96IvKct7LL3GtgNhEtUN71Sthm53g/p3YfofEvFoPNeRss91Tll0DODsygI1STSihD8e/Oz8WeySnSmWfRMGUcoUO77mQO2njfyZqp4sbS+aW1Hd3Ua6KDvHbZKtrkOTDoRkMNiOeMzPWl7aKeDbEuZ3sLFtaEP0df4cqtxDrAv2rFq/BFeq1aD1dXHOExrrEuPCItfFW2Ox6n2KPXd7iY6AKukroI3vh6yNXlbOGH4Q997tNIu/JXyxD+5agbeOQVRO10dfNKcT8K18jDvq+fUPYHy6J39MdfMdU2ZG4DovpIK9t4tiBulchNlxc9bISAd5LzLF+NycGAuCbZHOFAYcvU9HeleBTyvhd+8SbqVuXhO57QMtsfJeVe3VZX8bqbyd0mpLxNPwI16ZtdyGFniNPyKObqwOI/bxuGyOt9x09mY64LkGqOMv8h/C0ZFpawf/3cX5WaQG4ObYEdiexr+um3lPr1J5b82/cJX9Vr5q7emlPM81TXJ1f6GmjEup1Sei+B7QisEfzI9msiELEuikTejLG8F0OZlcgs0RkF9P0NrTh7JgOOmz7nmzZC09sNKSqxR6bKyU+/O4IlDrfO72INtjoS7BCcnsTYyFuh9hTAqsHCyzDEPZt3/adgHdMhularqpLQk8Nt/TJceyoNlxVtfv53v1Au+bFiN2nm9HbWLkGtqctB5UbQmO82whC8isk+s+ubkMkrjI7wk6Krxv6XYWMI9Swe+yr9O09G/0W+qFGJDxD8VdXQs9maBM6lsnelGzt95J5SuQIppbE/4ZYUm9Csbf32WtSY5dkoyexG9LDvj1Kd3CP7UE34WspDF4a1Gh5xhbE9ZUh3XOVbpMDHwhgc9sANnqZ8D1hOI62vt/LQZ22KaF3763SrtI52KxBWDbxpWnleBq0QsMadQb99YnIbfIdco8cXjDzB8Iy1ajUKURd91GidvArwc7mAoQsIR5hs9ex+g6JZ7YJu3arYbXMjflXNuq97dPmb3epNcs4oNnb2Q7g7O3tElpexslEVMaw3ASOvmfT/briHSq8gdg9wP+H2MShOZFZkVjFhottQtVnYjnAbsor9En4uwt5DXkdMZaWZOdCjKcdQGNNrrMEa0kp6pU6+6KNqnwOCV0ewaCNQF2PPIe8yvHjZfwZu7kR42cvh1kPWQcJXX6OrwvxOT6QYduvj0Bm9rRntw8v9LSRpT4ma2WBdafA6tUC9VU1BAF20hTvcsfNiBL6jLcvDiKYb0QUaVac3Dc4xwqEPydiB7YYxd48thvSNWmzbRZkDBLzNZ7R7qcTt++rXzHRs9j/CbD3eOc6KaHeWsgRyCQkdHnFcTfLpUaw0yPPBwz6PWydiCyXK4ChStSfDTkEeQsJWa4pEke/ugR2fKDg7IQmaCEu32NK0MmEQRvXZGN0XIp3uWftt0+l5koQP80KJMG6aO9yJ/YzI8Rvb8wqfJBAZw7k8AjxmEm7Lxu8YDdWQn8X2/+BOF1xo2cnajFYbhEc4pBB4rVh/VDldgzN7xMr+jMjh4UKaMjOWj4xtetiz+Y2hCj7tNv1XSagDT2DutQ3Buk7EqDjyrpCt31mE8ewndTw53vWaTG7lChX6ARi72cPWWxG72gnuG1K2FgA+WvIwLB1TpuLYIvYjZHQ38TuKiGCxM7mSMgSbeY5QYb6fZ0Wgl3LBnEth9jLYkKUK1p2Q3wSkL1y1reMCxFLywbB2L9T9ilrt2zpMzEBei1EQnc9eAcdwuqFjnbu4LiHvorerY66LbVYCf1PLQcBPu2eXtBCTKGvMBcPGiDGiDF0Qrf9JehoAvbWR0KVKMPuBGe3XUKUP4XuY7NHYHZraFyIALGxfKgYsWWPaIYoy4SIiUDsdoVPCXpyEaJNoWwM0iz3ExyhfYk9J9W9lu86xmgzdv/bUTeaGtwWwfiYQA6OZQKLvQQkaMHmDzD4rYBGzV7Vy9a0+9GQQWLPTnxDcZyHfSfG0xD7B2iz/UeuXQPYGWECuxNZuS7y0IiNxVfsW1wlW4O4bOTJJkj6lp19DQzpb+dp53BP/cqqD0xCZ6e8jl54zLEn9nbUy63GAWw1Kq+aW2F4xWj3v4e7Kfwt1EHlSvov2nP52DZ+hxVuXbbCN+jLebI3VWLtQbR3bIxIhjieH8i2628h0z19YrPLfa8Q7SmK3TMdBFoJw1A+NgsUUsvMH1sLHp+hEvoYjxgmwDjUPuoRRhzVgUnoQ/iOd8RoQ3WzOOrmVXM9abiMHdQekali2TZAUPY/mncIYKenCRgeSAV7mUaIEvpgGuqRwmdoZ+x/QuE6ytTJfeXOFZ7fv+qpb+oHwu+NAHZ6msDHHVQ4r2el/httWHq9/tVy1zghd83uFe0Jng26b+6/BX0bLbWLH9dytKtiHfQGLaGfQae4vBXIZgHvFqtD2UntzWmuw8knxorLxy5tsud85/OxMaS7DQe4VO8CsNnVkwLEHHqWdqjn0KO/s5y+egV+pwVguFwAG+0mvtL+xWHZ/oFHyt/ajx1i7FTZtHOF63faPgHdq1z12/R8r9J9bnfYceQPbbE0bnGgEjo7pd2jcp1B+52Ivb+Ho20bPgrxI3N031MtRFK7kfYl+x/F+HqZFrmO4rTD2IATmlnbV1Rg2Q5mUSZzZbTttxnriq5auKhCt/r0xaJsW6rb9pzrQww553TFm4RGjXqSyvfkVsiu6HsS02k1xAmNTbDzGe3cpTOoAt9Pgut7BerXrupAJfSh3nE9YH+CHfHLkXp4L0e7IYbBHF33Vduyb43+FcqYvHJs/7By1Yi1r+RynlFpLAez9zPWB1+Fn3sx+rqnYZtQGaqESGypToba23xB+xeH5dEcs2Zz0MtUoV8vY8PzmRuLrdyqWPV/1aYtG7E0r4vukE6IE00P9/FVBy6hs1M+ANZbHdG63ufu6o6d1O4zuw5NJ71q6NqIjg20yX50H+9YXfTro/TV1UWVfOvj8yVshDh4f8Y3lsD6/whsr585b3/sR3P3c5Jz+6dz1utW7Tb2Cxu9SV0eDODQd2SiM4QQj7e6XmWP6QymwPfTh37bBVTqV3XgEvpQF7kOHdlQ6mKBu9n1JOEcdlDfq6DATZlibsUpS+4LdjVQVrk0gOPlA9homfiwteDx6XoS6+rydlfFNr1Qty2WbbPpshiiLS5+bUKob/Gd2d/pP8Q9aHt18IKdhnt9p76NNGzdq06fbbEng/Zxn2bzQCZ0EuFZ4HWdrfq9UF3DTmqJ77OO9lxPShzdFVJboVDt7Mp/z16dZG0I3ysniTS/k3/mrxqk5hMBrPjca213v2r7F4dlJfQhaBw7baTC91aAWfv6kMm8Hz7Pnl9N3I/ndVTnegOZ0Ic6zHW4elcScagDzb6OO8/D7KDeQ5qOvvOohbhCTzYZrrNBsLWTvUc61xf8PiP7Saj7wN6z3GlT6tGcNwvyyqo+c9bKIuvog08Uqd+lru9rRgmjeCGW17rEU2T1QkUq56wb4mKi6LD7mJyxZVU7MmtlE9cNckI/ybFDZ0Kv6M44whU/b7s/6PoIR5Unw1lbPzmiwcVWPEYCequYSvDaIYaofTmEalSIR/GKxhIioXufyBB0sNnyRQFUpL4NVQct/DbHYtD3incxjoH2aGvfQj2bB7Ba34rZFe4j3uuzNzVv7cAmdDr5GbrzKscu/a6jXrua66Nq72PEbhl0Ft+Dn69+ezy+B5EQVybt8bgsv+qi1KEze8f3sr6WkdDfKauxHX69r/I77NXta6x9MOVV+q4e0Afm6twYDWxCH9pBXK907RE2rzce4X/voRiKfpzBycjEDCXfiVO++u0h+d6SKPvq3NoSYoja98SmxdS3b/63ZSjh5/8E8OXbbgthxgBx1NlEqH2wk8GfOlc4fN+O4+h0OfTG5KiTVeUFjpVnZ21o6rqBTuh09uV07HOOnbuPo579V6Wt0Z3XUf+4Lnq+V9i++u1hzdP+xWG5Cgk9xJBxqIOpb9/46jt04TQhfIawMehX6FHaP3RRcarLjtGmY7cvN237PmKRY+XGrHR9fPGYEQYbvmKgE/pQ37oOHW3MzraY4/7henV+Kz+kh7r49L2a8dXvEpbT6iok9DecIh+uFCqh+/aNr/7wVuX7FsJnCBuDfoX+X/m6y6mW6whnu7N+84h2aa9cYPld6v6+QP1GVFVC9+v0womZk4AV2XPWdNx7XE8+HN2VpjZtaZ6nOv5/Uxedl/7NWVOKoQiEOCkIFUsZdibHcsrFxThsm/gUuzDKvAJnvZ0Q22imSzmZ+CypD1QZ+IROp9uV2DmOvb47O13RKwDXofq3iTVrMpxj6FHV3vO0HurK1icM33kA5vttnwDadEMMPbeZS7IYIuYQNrLmmyQBUBEnvr/Ffs04vl+FHNt37FLH3qLpWgZuuN1ADXxCH9pbXK98Cz3CRvKfA3+7Dvks+nFKUYUS6/seRI1T2WXmAAGESuh1vMoMEXMIGwN3ldax377S8T3oVy4y/oRB3997tyd+xjgGexZxveioW2s1JXS6j863l7Q87NiT3y+g123HzWOi22S4PLqp6/g+shTrUZsiHEK8kCNUQi8St+oOJ+CbbIZbq9+35xOEbEndpyzJxc4K7Qb4viTfV29fV2D5iAJ1G1VVCX1qd7oOHdkLEtabaqbn0t49t3bf+DdOOiZ031y5Lb4JvdB7niO1fukAdkNN7gsx9BygOYVMhIg5hA0l9ELd5lTZdYSz3Vnn5Lgx7RsLLF/PsfKBAvUbVVUJfWp3nsmi6/2mvvfFSfpbYn+Bqe4KLYX4wRRy6Fn5SU/9ReA1r6cNX/VlfQ2g/1gAGzLhR+ApP/WPtFchSdS1HBKg/T1NAMbeGndDz0r9N+7UUcX11uSRHXYG6qsS+lB3s1NOYvEMx97fhATUb4i2b9Lv4vtlYruky7aqrg5xhuw63ObNhL6cCyO+V+jv0G8TvIP5l4EQ95IDhZLbTIiYvW3QB68RsU189Sk2/KvSm4Drq7RbVufmd2fPnNt7Ojbkw+VdFo/T31e3DA7ipxL68F53HXY3K98bbmrqN3ZQexfxWlPXFFoK8axnIYcBKj8YwEZpCZ3YNwkQ/90BbMhEGAK+J5ih/6d4mFZVyAqJ9M+E43vitMtQk8Y4Nm0g/kVqLzZK6G102CltYtzf21YVWfw6iXuGLgr7dVmfZ3WdZre32uN7ADU7H52ttwwm/nR99rU9zHvbv3guh7iX7BlCYfUQMYewYYHb79qnrOKjPEC6vhcfW3MMHQ2vbRyYvcTx+3QHvUap1CWhew+9Feg1151yNnyMeJ6SHdRmbI9YnzOeP7OTvpyzri8jX/0pYRLzC3zxfWxkRdi5/q/4KbEUXcDnp9CxIT/fYk9OVKUE69uqNKhgHHcWrN9ZfQP2C/t9q/QmEOLi49zeLrpuPbbrlgHaUJeEHupMvW/XkozOo9LrfStmV8gadrdH1abLrt53bZH7Ur596avf2ZgQ9/337zSa4PuBAXxMYj8K0f4AoXxkInTfhoorlZ0rAzjaNICNRptgn7f/i3GpZyPXcND/AJ2THfQapzLoP/RuHep6prkUZ/Lrdhjdq+N73q82waPIzFHfqzBf/c52Xdy5wuH75vBcxkHPSQVfn0dxFyfl4Uq+B7Xh1vy/he5b/4gSWuB3ZPd2b/F0uaen/qCon1hCQ0+ij98uwW/lXCqhZ3dJkSvjTgt7t1aQIDZneZHW94KfRWPwHcXw1R/WPH5g17Bi4rCVbl/Oh6PrCEduj/iYkcqn5lboXfEvvTcn3xq0b5NHH8bhZZ5m1mAf2c7TRi51/JyLhCjJ3+fA7/5qGjkhV0PDVTomnKl6W1JCz+g/dkrbIS/P2JRn1Wb8Ehcequj6qJoNIZ2Wx1lbHd+rMF/9tlCmLIa4Srcr9BT3xy7Az+JTIndfeIv95yJ39SiaMfo2SqARjYbokyP4bduJX7SC/XUxvm0AB1eyH9pcljLKcQmdnj90vE7osrqulNC7943r5DizuDc/zGX5XMe+OJRz2EmbMIR0hEPbs1T2gOd3szaEWIft07ETalb9b0LEJBthCfB7egKLrifprWDsijfa6Av7of1DoD+1nHl+hhptcgkjpe9fuwTYVB0l9C49ywHgKjY922Vzv9W7U+EH/Sr12F7Gfage4bhtguFDaBrHEOU3HPB+HsJQywb2ZkLsIL9za53n5yT0f+dpQ+rxCIQ4wdyQfeb3kUK0RLhIANtv8Nu7MIAdJxP4tjkLZzspF1O6CV/3FlNpdm0l9N796/qimdkx2/kqw96epm69l5307qlfa790WMAW/IiD6ZnInL42sWET4B5Fvuxrq03/OPrurbbvWqwQAfrmZsIZFyCkb7D/nI0EGX43O8gVxLVlgNjMhOuk3kDuPzKT4qLkyJABN8GWEnrvXgw1/NXby/CtjbrCGzqI3jS8iV7f7Jn+8RwAD0AKT5ZDZznEhk3t4N7vdb1FArUJgEcXUVDdUgj8JJDX7bFzp+1PPvbQH43+bUioWz7271J/iZRa+N3bUwWPRAziCXz43kKJGF45ppXQe3Bnh3mdzWf1qBJ609v4LOMkInQ7Ou3ZLQib6BeqzIQhe83jKxwQT0W6XmWzbVFke+QE5DF0HkBCXQlhakrZi757bco3LVSSAH1kz6T/OVBwS2PnAfarc5Blitik/qqIXcU+g3idFHT4/QFtfLdjXVlfj4vo+IiItmtretraRp4ucJsc5/qmt6JR2uSsxhUOME9y8DqIhoW+grVJRLuaYN+42b07E0usdtvD7kda8o9dLqCNKe4Zxm7HoNjfi4auh9g+EqLY42zbsQ/ayeL1Q2IvWXmN/eIl1i/Asj35shqyFvJFJJRvTE0pt+HvjCnfyl84kxAs8c4YOJTXaecfAttshDkl9D7dyI5zGz9Iexf0Mn2qhth8koeRUR66puqr39M9HI+B4zZUWr1nRb+Nc6JusoSfmULaz1P7G4U00leO2rfpm+PnkX3xdfbFfbFymp+lEdrLs8bEbH9U8NNaTPH5zRRO8vqA8yTafxb1Q8f127wxDFo9Dbnn6/EUO9AN/ABsSNi1+B45fPXzxP01KtnVc1PK+zRkU/ptYuQG+faNr75L80L4DGEjM3b67HQ2nJ+5sZ4rx9CmBysY+u8Cx2S/uZhD+YHDTWtOCT0fbzvLnJyvqnOtE501a6LIAceGIb9ck3DzhLkVbbonT0XVqR4B+m5borqzepEVjuh3tMVOUCpXiMtGN28NGNip2NSTJF2AKqF3AdO+mh3Ikvkf29cFXrbnRm3mdeML7byLRm7dgIZ+k7Zc2YB2DHoTvgKAl2oM4R/sh/tUPP6QFytHVbytpYanhJ4f/wn5qxauGdN24WBiK3AA+jM+vh3bT0T7+9GGWC8XyQq7jvfAQ8QcwkYWzynr6MfX+PIlxB73qlux0aHNqh40jG2E880AcV6tF8wPAAAGqUlEQVSIrWcC2GmsCSX0nF3LjmT3t8fmrF602kAldIMDT2tz5Q9GHR35gcVM7Md0rI/9Ndq95IiBh4g5hI2+TaQ/bVh4FeTxvpWrU+E6Qvk8sdtTHXUoIUY49ZrXPj2thN4HUMfmkENHLdOX8KN8ufVlkD5p9yW097NIiLP32OhetViHYo7tS/YTE6Bf7WmF1ZHbErt2cXc28X4JmeyiXJKO70S2W2iv3a5T6UFACb0HnM5N7FAXsC700FyMk4TO0Cv7HaZ2AF0WubSyQf7rvdRLE2tZ742OPvQcgX2ImEPYyN00+vcdxE4wf5pbKX3FnxFjqvdiBGsdMU/A2FgPg0d66A6MqhJ68a4Oee90Ajv634qH0CwNGLyEbEqrtkCqNEHpKeJZm9h2RMoc2kwy9Bx4rwoRcwgbhZtFXx+Ckr3L4PbCyvEUHsX08sT2n/FcxLPM8+hzYH01Rw/P0O6LHXUHSk0JvXh3n1xcpatG6Gc0uzqqwwZ+tBcR51KIXSGVOQz/DP73Jp7FkZtZLrskvVIN1NgQMYew4dQc+v2fyGdQ3gmxZFpm+RGx2AhRFZ8zz8vlUCrOkLdyR73DO77raxcCSuhdwHRbzY/qBbbZvd8Q5U8hjDTJBnxt2PMQZE7a9U3Ekmuq8g8cbYHvxRDfe36pYpafiATYD85ClsbFRsj1EV11mn6bFTb5cgn8/6JzY52+c3W+JPF+yzFmGxk73VF34NSU0N26PMSsdDtQlDmM69byhFrw+T2yGC5tqM7O8GNcodhB+nvIaHzZrGEbJaha+bBqAeWIJ0TMIWzkCLV/FfaLq5H1qGn/H8D2lxv7aznVsLkkdlI5O2KPR/7TyUq1lHyusO1fEr9freZUN5rShrSKIOEMb2HqTyii01mXnSJoW4nJfmiLd/op8P1zhBTsDUrEcxO+7R8/uBZLnnZFXOlCOxclwA2QNZDPIUX7wJjfgvwDsdftTuKz0oU220St9T2CnEg7j/bQL6xKzLOgtF9hxeEKpxH3+OGrqvONNs5KNJbkbT+0397KSNFyBwp2cvB35OY67I9FGgijtak/tohOR925YfJ6xzp97UIgaJLr4sN7NTtFFRO6HayOcmzcA+ykKzjqZqrBaCASemfjaffcrFsOmR2xJGIyM/LfyMQ2eQXmd/JdRQSiEGBfnB7DltTtdlFrX7RPGwm1E8f32j5tSP1u9slGX33CZBztXAlxKSfDZ08XRelUmAA7xcKIVwndPIKZxSOg4FfCxHKTRzymGnKyX2jcsicCIlAzAhxTdvI8JtlonEoBArqHXgBWe1XOHO3q77T2dTmX7WUQ9n+CVURABESgkQRI5NPRsMM8Gmcv3HrGQ38gVZXQ/br9RAd1uy9oSV1FBERABJpKwP4n/AIejdOLZDzgSVUEREAEREAEvAlwdT4P8p7HcLvmunj3ggyIgAiIgAiIgCcBEvkJHsncVLfyDEHqIiACIiACIiACPgRIxp/0TOZP+/gfdF3dQx/0PUDtFwEREIFwBFwf5W1FcHRrQZ8iIAIiIAIiIAIlEODKfB3Pq/M30bdn+VUcCegK3RGc1ERABERABIYR8P3/ByfwBFCjX7QzjJa+iIAIiIAIiEDVCHBl7fsSGbu4n6dq7VI8IiACIiACIjAwBEjE0yEvWEb2KH8YGGBqqAiIgAiIgAhUkQBJ/CCPRN5S/VQV26aYREAEREAERGAgCJCNfV8iYwn98oGApUaKgAiIgAiIQFUJkIx9XyJjCX2dqrZPcYmACIiACIhA4wmQiH1fImPJ/P7Gg1IDRUAEREAERKDKBEjGl1lG9izbVrmNik0EREAEREAEGk2AJO77Ehk7D3i+0ZBKaJxeLFMCdLkUAREQgZoT8H2JjDVf/yI18E4wbWB7MicCIiACItBgAlxZr0/zXkPGejRzMroneuhLVQREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREoJYE/j/n4Y6ts+HgRwAAAABJRU5ErkJggg==";

const SCORE_COLOR = (s: number) =>
  s >= 800 ? "#16a34a" : s >= 700 ? "#2563eb" : s >= 580 ? "#d97706" : "#dc2626";

const DECISION_BG: Record<string, string> = {
  STRONG_APPROVE: "#d1fae5", APPROVE: "#dbeafe",
  MANUAL_REVIEW: "#fef3c7", REJECT: "#fee2e2",
};
const DECISION_TEXT: Record<string, string> = {
  STRONG_APPROVE: "#065f46", APPROVE: "#1e40af",
  MANUAL_REVIEW: "#92400e", REJECT: "#991b1b",
};

function fmtN(n: number) {
  if (!n || isNaN(n)) return "₹0";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

type Lang = "en" | "hi";

const T = {
  en: {
    reportTitle: "Statement Intelligence Report",
    confidential: "Confidential · Internal Use Only",
    poweredBy: "Powered by Post AI",
    months: "months",
    transactions: "transactions",
    parseQuality: "Parse Quality",
    generated: "Generated",
    keyMetrics: "KEY METRICS",
    scoreBreakdown: "SCORE BREAKDOWN",
    avgIncome: "Avg Income",
    avgBalance: "Avg Balance",
    minBalance: "Min Balance",
    totalEMI: "Total EMI/mo",
    bounces: "Bounces",
    salaryMonths: "Salary Months",
    incomeSource: "Income Source",
    incomeStability: "Income Stability",
    bounceHistory: "Bounce History",
    balanceQuality: "Balance Quality",
    foir: "FOIR",
    spendingPattern: "Spending Pattern",
    total: "Total",
    monthlyBreakdown: "Monthly Breakdown",
    month: "Month",
    credits: "Credits",
    debits: "Debits",
    salary: "Salary",
    emi: "EMI",
    minBal: "Min Balance",
    avgBal: "Avg Balance",
    fraudSignals: "Fraud Signals",
    signal: "Signal",
    severity: "Severity",
    noFraud: "✓ No fraud signals detected",
    obligations: "Obligations & Behaviour",
    existingEMI: "Existing EMIs",
    ccDues: "Credit Card Dues",
    bnpl: "BNPL",
    loanApp: "Loan App Usage",
    gambling: "Gambling",
    investments: "Investments (SIP)",
    insurance: "Insurance",
    cashRatio: "Cash Withdrawal Ratio",
    none: "None",
    detected: "⚠ Detected",
    ofSpend: "of spend",
    aiRoadmap: "✦ Post AI — Score 900 Roadmap",
    fraud: "Fraud",
    high: "HIGH", medium: "MEDIUM", low: "LOW",
    perMonth: "/mo",
  },
  hi: {
    reportTitle: "बैंक स्टेटमेंट विश्लेषण रिपोर्ट",
    confidential: "गोपनीय · केवल आंतरिक उपयोग",
    poweredBy: "Post AI द्वारा संचालित",
    months: "माह",
    transactions: "लेनदेन",
    parseQuality: "पार्स गुणवत्ता",
    generated: "तैयार",
    keyMetrics: "मुख्य आंकड़े",
    scoreBreakdown: "स्कोर विवरण",
    avgIncome: "औसत आय",
    avgBalance: "औसत शेष राशि",
    minBalance: "न्यूनतम शेष",
    totalEMI: "कुल EMI/माह",
    bounces: "बाउंस",
    salaryMonths: "वेतन माह",
    incomeSource: "आय स्रोत",
    incomeStability: "आय स्थिरता",
    bounceHistory: "बाउंस इतिहास",
    balanceQuality: "शेष गुणवत्ता",
    foir: "FOIR",
    spendingPattern: "खर्च पैटर्न",
    total: "कुल",
    monthlyBreakdown: "मासिक विवरण",
    month: "माह",
    credits: "जमा",
    debits: "निकासी",
    salary: "वेतन",
    emi: "EMI",
    minBal: "न्यूनतम शेष",
    avgBal: "औसत शेष",
    fraudSignals: "धोखाधड़ी संकेत",
    signal: "संकेत",
    severity: "गंभीरता",
    noFraud: "✓ कोई धोखाधड़ी संकेत नहीं मिला",
    obligations: "दायित्व एवं व्यवहार",
    existingEMI: "मौजूदा EMI",
    ccDues: "क्रेडिट कार्ड बकाया",
    bnpl: "BNPL",
    loanApp: "लोन ऐप उपयोग",
    gambling: "जुआ",
    investments: "निवेश (SIP)",
    insurance: "बीमा",
    cashRatio: "नकद निकासी अनुपात",
    none: "कोई नहीं",
    detected: "⚠ पाया गया",
    ofSpend: "खर्च का",
    aiRoadmap: "✦ Post AI — 900 स्कोर का रोडमैप",
    fraud: "धोखाधड़ी",
    high: "उच्च", medium: "मध्यम", low: "निम्न",
    perMonth: "/माह",
  },
} as const;

const DECISION_LABELS: Record<string, Record<Lang, string>> = {
  STRONG_APPROVE: { en: "Strong Approve", hi: "दृढ़ अनुमोदन" },
  APPROVE:        { en: "Approve",        hi: "अनुमोदित" },
  MANUAL_REVIEW:  { en: "Manual Review",  hi: "मैन्युअल समीक्षा" },
  REJECT:         { en: "Reject",         hi: "अस्वीकृत" },
};

export function generateReport(data: StatementIntelligence, aiInsights: string, lang: Lang): string {
  const t = T[lang];
  const breakdown = data.scoreBreakdown ?? {};
  const sc = SCORE_COLOR(data.lendingScore);
  const decLabel = DECISION_LABELS[data.lendingDecision]?.[lang] ?? data.lendingDecision;
  const decBg = DECISION_BG[data.lendingDecision] ?? "#fef3c7";
  const decTxt = DECISION_TEXT[data.lendingDecision] ?? "#92400e";
  const fraudColor = data.fraudRisk === "high" ? "#dc2626" : data.fraudRisk === "medium" ? "#d97706" : "#16a34a";
  const fraudLabel = data.fraudRisk === "high" ? t.high : data.fraudRisk === "medium" ? t.medium : t.low;
  const dateStr = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const scoreRows = ([
    [t.incomeStability, breakdown.incomeStability ?? 0, 25],
    [t.bounceHistory,   breakdown.bounceHistory ?? 0,   25],
    [t.balanceQuality,  breakdown.balanceQuality ?? 0,  20],
    [t.foir,            breakdown.foirScore ?? 0,        15],
    [t.spendingPattern, breakdown.spendingPattern ?? 0,  15],
  ] as [string, number, number][]).map(([label, score, max]) => {
    const pct = max > 0 ? (score / max) * 100 : 0;
    const clr = pct >= 80 ? "#16a34a" : pct >= 50 ? "#2563eb" : pct >= 30 ? "#d97706" : "#dc2626";
    return `<div class="bar-row">
      <span class="bar-lbl">${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${clr}"></div></div>
      <span class="bar-val" style="color:${clr}">${score}/${max}</span>
    </div>`;
  }).join("") + `<div class="bar-total">${t.total}: ${breakdown.total ?? 0}/100</div>`;

  const monthRows = data.monthlyBreakdown.map((m) => `
    <tr>
      <td class="fw6">${m.label}</td>
      <td class="cr">${fmtN(m.totalCredits)}</td>
      <td class="dr">${fmtN(m.totalDebits)}</td>
      <td class="sl">${m.salaryAmount > 0 ? fmtN(m.salaryAmount) : "—"}</td>
      <td class="em">${m.emiTotal > 0 ? fmtN(m.emiTotal) : "—"}</td>
      <td style="color:${m.minBalance < 5000 ? "#dc2626" : "#374151"}">${fmtN(m.minBalance)}</td>
      <td>${fmtN(m.avgBalance)}</td>
      <td class="tc">${m.bounceCount > 0 ? `<span class="badge-red">${m.bounceCount}</span>` : "—"}</td>
    </tr>`).join("");

  const fraudRows = data.fraudSignals.length === 0
    ? `<tr><td colspan="2" class="no-fraud">${t.noFraud}</td></tr>`
    : data.fraudSignals.map((s) => {
        const sev = s.severity === "high" ? t.high : s.severity === "medium" ? t.medium : t.low;
        const sevClr = s.severity === "high" ? "#dc2626" : s.severity === "medium" ? "#d97706" : "#ca8a04";
        const sevBg = s.severity === "high" ? "#fee2e2" : s.severity === "medium" ? "#fef3c7" : "#fefce8";
        return `<tr>
          <td>
            <div class="fraud-type" style="color:${sevClr}">${s.type.replace(/_/g, " ")}</div>
            <div class="fraud-detail">${s.detail}</div>
          </td>
          <td><span class="sev-badge" style="background:${sevBg};color:${sevClr}">${sev}</span></td>
        </tr>`;
      }).join("");

  const yesClr = "#16a34a", noClr = "#6b7280", warnClr = "#dc2626";
  const oblRows = [
    [t.existingEMI,   fmtN(data.existingEMIs) + t.perMonth, true],
    [t.ccDues,        data.creditCardDues > 0 ? fmtN(data.creditCardDues) + t.perMonth : t.none, data.creditCardDues === 0],
    [t.bnpl,          data.bnplUsage ? fmtN(data.bnplAmount) + t.perMonth : t.none, !data.bnplUsage],
    [t.loanApp,       data.loanAppUsage ? t.detected : t.none, !data.loanAppUsage],
    [t.gambling,      data.gamblingDetected ? t.detected : t.none, !data.gamblingDetected],
    [t.investments,   data.hasInvestments ? fmtN(data.investmentAmount) + t.perMonth + " ✓" : t.none, data.hasInvestments],
    [t.insurance,     data.hasInsurance ? "✓" : t.none, data.hasInsurance],
    [t.cashRatio,     Math.round(data.cashWithdrawalRatio * 100) + "% " + t.ofSpend, data.cashWithdrawalRatio < 0.2],
  ] as [string, string, boolean][];

  const oblHTML = oblRows.map(([lbl, val, good]) =>
    `<tr><td>${lbl}</td><td style="color:${good ? yesClr : (val.includes("⚠") ? warnClr : noClr)};font-weight:600">${val}</td></tr>`
  ).join("");

  const aiHTML = aiInsights
    ? `<div class="ai-card">
        <div class="ai-header">
          <span class="ai-dot">✦</span>
          <span class="ai-title">${t.aiRoadmap}</span>
        </div>
        <div class="ai-body">${aiInsights.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
      </div>`
    : "";

  const fontFamily = lang === "hi"
    ? "'Noto Sans Devanagari', 'Mangal', Arial, sans-serif"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>${t.reportTitle} — PostMoney</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:${fontFamily};background:#f0f4f8;color:#1e293b;font-size:13px}
/* Header */
.hdr{background:linear-gradient(135deg,#0a3d2e 0%,#0d5c40 100%);padding:24px 36px;display:flex;justify-content:space-between;align-items:center}
.logo-img{height:48px;filter:brightness(0) invert(1)}
.hdr-sub{font-size:11px;color:rgba(255,255,255,.65);margin-top:4px;letter-spacing:.3px}
.hdr-right{text-align:right;color:rgba(255,255,255,.85);font-size:11.5px;line-height:1.7}
.hdr-bank{font-size:17px;font-weight:700;color:#fff}
/* Hero */
.hero{margin:20px 36px;background:#fff;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,.08);padding:24px;display:grid;grid-template-columns:150px 1fr 240px;gap:28px}
.score-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}
.score-ring{width:110px;height:110px;border-radius:50%;border:9px solid ${sc};display:flex;flex-direction:column;align-items:center;justify-content:center}
.score-num{font-size:40px;font-weight:800;line-height:1;color:${sc}}
.score-900{font-size:11px;color:#94a3b8;margin-top:2px}
.dec-badge{padding:5px 14px;border-radius:20px;font-size:11.5px;font-weight:700;background:${decBg};color:${decTxt};margin-top:2px}
.fraud-badge{font-size:11px;font-weight:600;color:${fraudColor}}
/* Metrics */
.metrics-col{}
.metrics-hdr{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
.metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.metric-card{background:#f8fafc;border-radius:10px;padding:9px 12px;border-left:3px solid #e2e8f0}
.metric-lbl{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.4px}
.metric-val{font-size:15px;font-weight:700;color:#1e293b;margin-top:2px}
/* Score bars */
.bars-col{}
.bars-hdr{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px}
.bar-row{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.bar-lbl{width:110px;font-size:10.5px;color:#64748b;flex-shrink:0}
.bar-track{flex:1;height:7px;background:#e2e8f0;border-radius:4px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px}
.bar-val{width:36px;font-size:10.5px;font-weight:700;text-align:right}
.bar-total{text-align:right;font-size:12px;font-weight:700;border-top:1px solid #e2e8f0;padding-top:6px;margin-top:4px;color:#1e293b}
/* Sections */
.section{margin:14px 36px;background:#fff;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,.07);overflow:hidden}
.sec-hdr{background:#f8fafc;padding:12px 20px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:8px}
.sec-icon{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.sec-title{font-size:12.5px;font-weight:700;color:#1e293b;text-transform:uppercase;letter-spacing:.5px}
.sec-body{padding:0}
/* Table */
table{width:100%;border-collapse:collapse}
thead th{background:#f8fafc;padding:9px 16px;font-size:10.5px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.4px;text-align:left;border-bottom:1px solid #e2e8f0}
tbody td{padding:9px 16px;font-size:12px;border-bottom:1px solid #f1f5f9;vertical-align:top}
tbody tr:last-child td{border-bottom:none}
tbody tr:nth-child(even) td{background:#fafbfc}
.fw6{font-weight:600;color:#374151}
.cr{color:#16a34a;font-weight:600}
.dr{color:#dc2626;font-weight:600}
.sl{color:#2563eb}
.em{color:#d97706}
.tc{text-align:center}
.badge-red{display:inline-block;width:22px;height:22px;background:#fee2e2;color:#dc2626;border-radius:50%;font-weight:700;text-align:center;line-height:22px;font-size:11px}
/* Fraud */
.no-fraud{padding:14px 16px;color:#16a34a;font-weight:600}
.fraud-type{font-size:12px;font-weight:700;margin-bottom:2px}
.fraud-detail{font-size:11px;color:#64748b;line-height:1.5}
.sev-badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase}
/* Two col */
.two-col{margin:14px 36px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.two-col .section{margin:0}
/* AI */
.ai-card{margin:14px 36px;background:linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%);border:1px solid #ddd6fe;border-radius:14px;padding:22px}
.ai-header{display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #ddd6fe}
.ai-dot{font-size:16px;color:#7c3aed}
.ai-title{font-size:13px;font-weight:700;color:#5b21b6}
.ai-body{font-size:12px;line-height:1.85;color:#374151;white-space:pre-wrap}
/* Footer */
.footer{margin:14px 36px 36px;padding:12px 0;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
@media print{body{background:#fff}@page{margin:15mm}}
</style>
</head>
<body>

<div class="hdr">
  <div>
    <img class="logo-img" src="data:image/png;base64,${LOGO_B64}" alt="PostMoney" />
    <div class="hdr-sub">${t.reportTitle}</div>
  </div>
  <div class="hdr-right">
    <div class="hdr-bank">${data.detectedBank}</div>
    <div>${data.statementMonths} ${t.months} · ${data.transactionCount} ${t.transactions}</div>
    <div>${t.generated}: ${dateStr}</div>
    <div>${t.parseQuality}: <strong style="color:${data.parseQuality === "high" ? "#4ade80" : "#fbbf24"}">${data.parseQuality.toUpperCase()}</strong></div>
  </div>
</div>

<div class="hero">
  <div class="score-wrap">
    <div class="score-ring">
      <div class="score-num">${data.lendingScore}</div>
      <div class="score-900">/ 900</div>
    </div>
    <div class="dec-badge">${decLabel}</div>
    <div class="fraud-badge">${t.fraud}: ${fraudLabel}</div>
  </div>
  <div class="metrics-col">
    <div class="metrics-hdr">${t.keyMetrics}</div>
    <div class="metric-grid">
      ${([
        [t.avgIncome,    fmtN(data.avgMonthlyIncome) + t.perMonth],
        [t.avgBalance,   fmtN(data.avgMonthlyBalance)],
        [t.minBalance,   fmtN(data.minMonthlyBalance)],
        [t.foir,         Math.round(data.foir * 100) + "%"],
        [t.totalEMI,     fmtN(data.totalObligations)],
        [t.bounces,      String(data.bounceCount)],
        [t.salaryMonths, data.salaryMonths + "/" + data.statementMonths],
        [t.incomeSource, data.primaryIncomeSource],
      ] as [string,string][]).map(([l,v]) =>
        `<div class="metric-card"><div class="metric-lbl">${l}</div><div class="metric-val">${v}</div></div>`
      ).join("")}
    </div>
  </div>
  <div class="bars-col">
    <div class="bars-hdr">${t.scoreBreakdown}</div>
    ${scoreRows}
  </div>
</div>

<div class="section">
  <div class="sec-hdr"><div class="sec-icon" style="background:#eff6ff">📅</div><span class="sec-title">${t.monthlyBreakdown}</span></div>
  <div class="sec-body">
    <table>
      <thead><tr>
        <th>${t.month}</th><th>${t.credits}</th><th>${t.debits}</th>
        <th>${t.salary}</th><th>${t.emi}</th>
        <th>${t.minBal}</th><th>${t.avgBal}</th><th>${t.bounces}</th>
      </tr></thead>
      <tbody>${monthRows}</tbody>
    </table>
  </div>
</div>

<div class="two-col">
  <div class="section">
    <div class="sec-hdr"><div class="sec-icon" style="background:#fef2f2">🛡</div><span class="sec-title">${t.fraudSignals}</span></div>
    <div class="sec-body">
      <table>
        <thead><tr><th>${t.signal}</th><th>${t.severity}</th></tr></thead>
        <tbody>${fraudRows}</tbody>
      </table>
    </div>
  </div>
  <div class="section">
    <div class="sec-hdr"><div class="sec-icon" style="background:#f0fdf4">💳</div><span class="sec-title">${t.obligations}</span></div>
    <div class="sec-body">
      <table><tbody>${oblHTML}</tbody></table>
    </div>
  </div>
</div>

${aiHTML}

<div class="footer">
  <span>PostMoney · ${t.confidential}</span>
  <span>${t.poweredBy} · ${new Date().toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
</div>

<script>window.onload=function(){window.print()}<\/script>
</body></html>`;
}
