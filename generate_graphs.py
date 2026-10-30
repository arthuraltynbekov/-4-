
import json
import os
import matplotlib.pyplot as plt

RESULTS_DIR = "results"
GRAPHS_DIR = "graphs"

os.makedirs(GRAPHS_DIR, exist_ok=True)


def load_results(filename):
    path = os.path.join(RESULTS_DIR, filename)

    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


# Загружаем результаты трех тестов
load = load_results("load-summary.json")
stress = load_results("stress-summary.json")
spike = load_results("spike-summary.json")

tests = {
    "Load": load,
    "Stress": stress,
    "Spike": spike
}

names = list(tests.keys())

avg = []
p95 = []
maximum = []
requests = []

for result in tests.values():
    metrics = result["metrics"]

    avg.append(metrics["http_req_duration"]["avg"])
    p95.append(metrics["http_req_duration"]["p(95)"])
    maximum.append(metrics["http_req_duration"]["max"])
    requests.append(metrics["http_reqs"]["count"])


# График 1. Сравнение времени ответа
x = range(len(names))
width = 0.25

plt.figure(figsize=(10, 6))

plt.bar([i - width for i in x], avg, width, label="Среднее")
plt.bar(x, p95, width, label="p95")
plt.bar([i + width for i in x], maximum, width, label="Максимум")

plt.xticks(list(x), names)
plt.ylabel("Время ответа (мс)")
plt.title("Сравнение времени ответа")
plt.legend()
plt.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.savefig(f"{GRAPHS_DIR}/response-time.png", dpi=200)
plt.close()


# График 2. Сравнение p95 с SLA
plt.figure(figsize=(9, 5))

plt.bar(names, p95, label="p95")
plt.axhline(2000, linestyle="--", label="SLA: 2000 мс")

plt.ylabel("Время ответа (мс)")
plt.title("Сравнение p95")
plt.legend()
plt.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.savefig(f"{GRAPHS_DIR}/p95-comparison.png", dpi=200)
plt.close()


# График 3. Количество запросов
plt.figure(figsize=(9, 5))

plt.bar(names, requests)

plt.ylabel("Количество запросов")
plt.title("Количество выполненных запросов")
plt.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.savefig(f"{GRAPHS_DIR}/requests-comparison.png", dpi=200)
plt.close()


print("Графики успешно созданы в папке graphs!")
