"""Build a public, allowlisted data snapshot; never copy private audit outputs."""
import argparse
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path

FIELDS = [
    "success", "score", "turns", "actions", "empty_retry", "drop",
    "empty_regrasp", "drop_regrasp", "direct_attempts", "direct_success",
    "table_attempts", "table_success", "support_attempts", "support_success",
    "view_same", "view_opposite", "abandon_near_action", "abandon_near_turn",
    "abandon_action_limit", "abandon_turn_limit", "collision_arms",
    "collision_arm_object", "collision_arm_table", "knockdown", "wrong_object",
    "fine_placement_fail",
]
API_FIELDS = [
    "success", "score", "turns", "actions", "emptyRetry", "drops", "emptyRegrasp",
    "dropRegrasp", "directAttempts", "directSuccess", "tableAttempts", "tableSuccess",
    "supportAttempts", "supportSuccess", "viewSame", "viewOpposite",
    "abandonNearAction", "abandonNearTurn", "abandonActionLimit", "abandonTurnLimit",
    "collisionArms", "collisionArmObject", "collisionArmTable", "knockdown",
    "wrongObject", "finePlacementFail",
]
LABELS = [
    "成功", "得分", "模型决策轮数", "实际环境控制步", "空夹", "夹取掉落",
    "空夹后成功重夹", "掉落后成功重夹", "直接换手尝试", "直接换手成功",
    "桌面换手尝试", "桌面换手成功", "其他支撑面换手尝试", "其他支撑面换手成功",
    "同臂补视野", "异侧手臂补视野", "靠近动作预算主动放弃",
    "靠近决策预算主动放弃", "达到动作预算主动放弃", "达到决策预算主动放弃",
    "手臂间异常碰撞", "手臂与物体异常碰撞", "手臂与桌面异常碰撞",
    "非目标物碰倒", "选错物体", "精细放置失败",
]
BOARD = "https://na-wen.github.io/robodojo-board/"
PRIVATE = re.compile(
    r"(?:/Users/|/data/user/|/home/|/tmp/|/private/)[^\s，。；;\"<>]*"
    r"|(?:sk-|ghp_|github_pat_)[A-Za-z0-9_-]{15,}"
)


def clean(value, limit=1800):
    if value is None:
        return ""
    return PRIVATE.sub("[private path omitted]", str(value))[:limit]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path):
    return json.loads(path.read_text())


def metric(value, status, reason="", original=None):
    if isinstance(value, bool):
        value = int(value)
    if status in {"unknown", "na", "pending", "self_report"}:
        value = None
    return {"value": value, "status": status, "reason": clean(reason),
            "original_status": original or status}


def base_run(run, gid):
    return {
        "id": run["run_id"], "group": gid,
        **{key: run[key] for key in ("task", "variant", "seed", "scene")},
        "metrics": {}, "events": [], "videos": [], "coverage": [],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--approved", required=True, type=Path)
    parser.add_argument("--index", required=True, type=Path)
    parser.add_argument("--cache", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    approved = read(args.approved)
    index = {x["run_id"]: x for x in read(args.index)}
    public = read(args.cache / "runs.json")
    groups_source = read(args.cache / "groups.json")
    medium = read(args.cache / "persistent.json")
    definitions = read(args.cache / "definitions.json")["definitions"]
    groups = []
    for gid, name, color in [("low", "Low", "#3979ac"), ("high", "High", "#bf6252")]:
        groups.append({
            "id": gid, "name": name, "long_name": f"persistent-cap20 · {name} · 首轮",
            "color": color, "effort": gid, "family": "persistent-cap20",
            "audit": "approved", "planned": 42, "source": "本批批准分析",
            "model": "gpt-6-astra", "reviewer": "gpt-6-sol / gpt-6.1-sol（混合历史）",
            "description": "0.2秒基础扫描及关键动作局部连续源帧核查；不是全帧连续观看。",
            "relation": "首轮effort对照；逐任务环境一致性仍需保留原始凭证。",
            "url": None,
        })
    names = {
        "persistent": ("历史 Medium", "#3a8064"),
        "semantic": ("Semantic EEF", "#978344"),
        "action_horizon": ("Action Horizon", "#7969a4"),
        "dual42-sequence-medium-20261016": ("EEF Sequence", "#518fa0"),
        "o23-compact-medium-r1": ("O23 Compact", "#aa607c"),
        "persistent-cap20-o23-depthpro": ("O23 DepthPro", "#77705f"),
    }
    for group in groups_source:
        gid = group["id"]
        name, color = names[gid]
        values = {v["name"]: v["value"] for v in group["setting"]["values"]}
        groups.append({
            "id": gid, "name": name, "long_name": group["name"], "color": color,
            "effort": "medium" if gid == "persistent" else "参见源配置",
            "family": values.get("profile"), "planned": group["runs"],
            "audit": "interim" if group.get("audit_completion") == "interim"
                     else "logs_images" if gid.startswith("dual42") else "approved",
            "source": "行为看板公开快照", "model": values.get("model"),
            "reviewer": "参见原报告", "description": clean(group["coverage"], 3500),
            "relation": "历史Medium；25条Sim5.1 / 17条Sim6，非新配套实验。"
                        if gid == "persistent" else "改变观察或动作配置，仅作配置对照。",
            "url": BOARD + group["submission_links"]["report"],
            "setting_sha": group["setting"]["id"],
        })
    order = ["low", "persistent", "high"] + [g["id"] for g in groups if g["id"] not in {"low", "persistent", "high"}]
    groups.sort(key=lambda g: order.index(g["id"]))
    runs = []
    for effort, rows in approved.items():
        for row in rows:
            source = index[row["run"]["run_id"]]
            local = args.approved.parent / "sources" / effort / Path(source["local_result"]).name
            assert digest(local) == source["sha256"] == row["approval"]["result_sha256"]
            result = row["result"]
            item = base_run(row["run"], effort)
            item["audit"] = "approved"
            item["config"] = {"profile": "persistent-cap20", "effort": effort,
                              "model": "gpt-6-astra", "max_decisions": 100,
                              "native_control_cap": 20, "simulator": "未在本发布包核实"}
            item["source"] = {
                "analysis_sha256": source["sha256"], "models": source["call_models"],
                "files": [{"kind": name, "sha256": entry["sha256"], "bytes": entry["bytes"]}
                          for name, entry in source["source_files"].items()],
            }
            for m in result["metrics"]:
                i = int(m["id"][1:]) - 1
                status = {"native": "confirmed", "confirmed": "lower_bound",
                          "zero_confirmed": "lower_bound",
                          "lower_bound_with_candidates": "lower_bound",
                          "self_report_confirmed": "self_report",
                          "unavailable": "unknown"}.get(m["status"], "unknown")
                item["metrics"][FIELDS[i]] = metric(m["value"], status, m["reason"], m["status"])
            for e in result["events"]:
                item["events"].append({
                    "id": clean(e["event_id"]), "metrics": [FIELDS[int(c[1:]) - 1] for c in e["metric_ids"]],
                    "status": e["status"], "object": clean(e.get("object")),
                    "arm": clean(e.get("arm_direction")), "result": clean(e.get("result")),
                    "visual": clean(e.get("visual_evidence")), "uncertainty": clean(e.get("uncertainty_reason")),
                    "time": [e.get("video_start"), e.get("video_end")],
                    "decisions": [e.get("decision_start"), e.get("decision_end")],
                    "frames": [clean(f, 250) for f in e.get("frame_ids", [])],
                })
            for c in result["coverage"]:
                item["coverage"].append({k: c.get(k) for k in
                                         ("view", "fps", "frame_count", "duration_seconds",
                                          "base_interval", "base_complete", "action_review_complete")})
            runs.append(item)
    full_medium = {r["run_id"]: r for r in medium["runs"]}
    for row in public:
        item = base_run(row, row["group_id"])
        item["audit"] = next(g["audit"] for g in groups if g["id"] == row["group_id"])
        for field, api_field in zip(FIELDS, API_FIELDS):
            status = row.get("metric_status", {}).get(field, "unknown")
            item["metrics"][field] = metric(row["metrics"].get(api_field), status)
        item["source"] = {"url": BOARD + "api/v1/runs.json", "files": []}
        item["config"] = {}
        if row["run_id"] in full_medium:
            original = full_medium[row["run_id"]]
            config = original["configuration"]
            item["config"] = {k: config.get(k) for k in
                              ("profile", "effort", "model", "max_decisions",
                               "native_control_cap", "observations", "prompt", "client_version")}
            item["config"]["simulator"] = config.get("simulator_package_isaacsim", "unknown")
            aux = config.get("audit_auxiliary", {})
            for field, m in item["metrics"].items():
                m["reason"] = clean(aux.get("metric_reasons", {}).get(field))
            item["videos"] = [
                {k: video[k] for k in ("camera", "url", "sha256", "bytes")}
                for video in original["videos"]
                if video.get("url", "").startswith("https://cloud.tsinghua.edu.cn/")
            ]
            for e in original["events"]:
                item["events"].append({
                    "id": e["id"], "metrics": [FIELDS[int(c[1:]) - 1] for c in
                        sorted(set(re.findall(r"\bm(?:0[1-9]|1[0-9]|2[0-6])\b", e.get("basis", ""))))],
                    "status": "confirmed" if e["confidence"] == "确认" else "uncertain",
                    "object": clean(e["object"]), "arm": clean(e["arm"]), "result": clean(e["result"]),
                    "visual": "", "uncertainty": clean(e.get("uncertain_reason")),
                    "time": e.get("time_range") or [None, None], "decisions": e.get("turns", []),
                    "frames": [], "source_url": BOARD + "submissions/persistent/events.json",
                })
            item["source"]["files"] = [
                {k: a[k] for k in ("kind", "sha256", "url") if k in a}
                for a in original["artifacts"]
                if a.get("kind") in {"native_terminal", "config", "source_lock"}
            ]
        runs.append(item)
    codes = []
    sections = ["结果与投入"] * 4 + ["夹取与恢复"] * 4 + ["换手"] * 6 + ["补视野"] * 2 + ["预算放弃"] * 4 + ["碰撞与扰动"] * 4 + ["目标与放置"] * 2
    for i, field in enumerate(FIELDS):
        definition = next((d["description"] for d in definitions if d["key"] in {field, API_FIELDS[i]}), "")
        codes.append({"id": f"m{i+1:02}", "key": field, "label": LABELS[i],
                      "section": sections[i], "definition": definition,
                      "unit": "0/1" if i == 0 else "分" if i == 1 else "轮" if i == 2 else "步" if i == 3 else "次"})
    data = {
        "version": "0.1", "built_at": datetime.now().astimezone().isoformat(),
        "audit_observed": "2026-10-25 03:37 +08:00",
        "groups": groups, "metrics": codes, "runs": runs,
        "missing": [{"group": "high", "task": "push_T", "variant": "random", "seed": 0, "scene": 0,
                     "status": "pending", "reason": "分析受413限制，未纳入83份批准结果；本页面未发起重跑。"}],
        "inputs": [{"name": p.name, "sha256": digest(p)} for p in
                   [args.approved, args.index] + list(args.cache.glob("*.json"))],
        "notes": [
            "独立比较原型，不是官方看板的新提交或完整84份验收声明。",
            "视觉计数统一按已声明覆盖内的确认下界展示；候选事件不计入确认数。",
            "预算自述不升级为客观预算证据，本页面将此类指标排除并保留原状态。",
            "模型决策与环境控制步分开；不等于token、费用或墙钟耗时。",
            "任务等权均分，不是五能力等权总分；本包缺完整能力权重映射，不估算。",
            "匹配task/variant/seed/scene不等于完全控制变量；历史模拟器及审核方法差异保留。",
        ],
    }
    assert len(runs) == 335 and len({r["id"] for r in runs}) == 335
    assert all(set(r["metrics"]) == set(FIELDS) for r in runs)
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    assert not PRIVATE.search(payload)
    for forbidden in ("note_quote", "rawreasoning", "rpc_body", "authorization", "credentials"):
        assert f'"{forbidden}"' not in payload.lower()
    args.out.mkdir(exist_ok=True)
    (args.out / "data.json").write_text(payload, encoding="utf-8")
    (args.out / "data.js").write_text("window.AUDIT_DATA=" + payload.replace("</", "<\\/") + ";\n", encoding="utf-8")
    print(json.dumps({"runs": len(runs), "events": sum(len(r["events"]) for r in runs),
                      "data_sha256": digest(args.out / "data.json")}, indent=2))


if __name__ == "__main__":
    main()
