# Datasets

This project's core RAG knowledge base lives in `../knowledge_base/` (the fictional
TechMart Electronics company documents). The public datasets below are optional —
use them to train/evaluate the Intent Detection Agent or to stress-test retrieval
quality with more real-world data.

| Dataset | Use case | Link |
|---|---|---|
| CFPB Consumer Complaint Database | Real complaint narratives, issue categories | https://www.consumerfinance.gov/data-research/consumer-complaints/ |
| Banking77 | 77-intent classification (great for tuning Intent Detection Agent) | https://huggingface.co/datasets/PolyAI/banking77 |
| DailyDialog | Multi-turn dialogue modeling | https://github.com/liuzeming01/XDailyDialog |
| SQuAD 2.0 | Question answering / retrieval evaluation | https://github.com/rajpurkar/SQuAD-explorer |
| MS MARCO | Large-scale semantic retrieval benchmark | https://github.com/microsoft/MSMARCO-Question-Answering |

## How to use one (example: Banking77)

```bash
pip install datasets
python -c "
from datasets import load_dataset
ds = load_dataset('PolyAI/banking77')
ds['train'].to_csv('datasets/banking77_train.csv')
"
```

Then use `banking77_train.csv` to build a labeled eval set for
`backend/agents/intent_detector.py` — compare its predicted intents against
the dataset's ground-truth categories to measure classification accuracy.
