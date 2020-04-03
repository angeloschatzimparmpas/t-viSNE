# t-viSNE #

This Git repository contains the code that accompanies a research publication so-called "t-viSNE: Interactive Assessment and Interpretation of t-SNE Projections". The details of the experiments and the research outcome are described in [this paper](https://arxiv.org/abs/2002.06910).

**Note:** This repository is a version of t-SNE modified to support ongoing research. It may be slightly slower than the original. If you're just trying to run t-SNE, check the original repository that we forked from.

# Installation #

On Linux or OS X, compile the source using the following command:

```
g++ sptree.cpp tsne.cpp tsne_main.cpp -o bh_tsne -O2
```

The executable will be called `bh_tsne`.

On Windows using Visual C++, do the following in your command line:

- Find the `vcvars64.bat` file in your Visual C++ installation directory. This file may be named `vcvars64.bat` or something similar. For example:

```
  // Visual Studio 12
  "C:\Program Files (x86)\Microsoft Visual Studio 12.0\VC\bin\amd64\vcvars64.bat"

  // Visual Studio 2013 Express:
  C:\VisualStudioExp2013\VC\bin\x86_amd64\vcvarsx86_amd64.bat
```

- From `cmd.exe`, go to the directory containing that .bat file and run it.

- Go to `bhtsne` directory and run:

```
  nmake -f Makefile.win all
```

The executable will be called `windows\bh_tsne.exe`.

# Usage #

The code comes with wrappers for Matlab and Python. These wrappers write your data to a file called `data.dat`, run the `bh_tsne` binary, and read the result file `result.dat` that the binary produces. There are also external wrappers available for [Torch](https://github.com/clementfarabet/manifold), [R](https://github.com/jkrijthe/Rtsne), and [Julia](https://github.com/zhmz90/BHTsne.jl). Writing your own wrapper should be straightforward; please refer to one of the existing wrappers for the format of the data and result files.

Demonstration of usage in Python:

```
# first terminal: hosting the visualization side (client)
python3 -m http.server # for Python3
#or 
python -m SimpleHTTPServer 8000 # for Python2

# second terminal: hosting the computational side (server)
FLASK_APP=tsneGrid.py flask run
```

# t-viSNE
