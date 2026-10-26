# 四组首轮行为分析

Low / High / O1 Compact / O456 Clear。仅本次四组，不包含历史看板分析与后补devset。
新增O1 Standard的41份批准分析单独展示，不纳入本报告的固定四组结论。

## 范围与数据核对

各组已获单项批准分析42 / 41 / 40 / 41份；共同40个task / variant / seed / scene，统一排除build_tower和push_T。每项指标再取四组有效交集。
原生成功、得分及任务条件逐条核对164条；与原批准结果核对4264个指标值与状态、1078条事件定位。数据SHA：`4c5642a0470e4301dc2c5f42d3d4eaa120dd64819a583d87158260d114bbad4c`。
O配置整批最终验收尚未完成。统计核对不是新的全视频审核；空夹差异描述原核查覆盖内的确认计数。
下文所有四组数字按Low / High / O1 / O456顺序排列。视觉数值均为声明核查覆盖内的确认下界，未知不补零。

## 主要结论

### O1 Compact在共同任务上的成功率和均分最高

40个共同任务中，四组成功率为30.0% / 27.5% / 32.5% / 27.5%，均分为0.3525 / 0.3563 / 0.3788 / 0.3388。O1比Low多成功1项，比High和O456多2项。
指标证据：m01 / m02。任务来源：play_Xylophone、sort_nesting_dolls_by_size、fold_clothes。

### 半数任务得分一致，10项在四组均为零分

20/40项任务的四组得分完全相同：7项均成功、10项均零分、3项相同部分得分。共同零分包括倒液体、扫积木和工具收纳，配置变化没有消除这些首轮难点。
指标证据：m01 / m02。任务来源：pour_liquid_into_cup、sweep_blocks、store_tools_in_toolbox。

### High增加决策、控制和补视野，未提高总体成功率

相对Low，High记录的决策总数增加4.75%，控制步增加6.25%；异侧补视野确认计数由28增至47。成功项由12变为11，均分仅提高0.0038。
指标证据：m03 / m04 / m16 / m01 / m02。任务来源：align_blocks、plug_in_charger、pack_objects_into_box。

### O456 Clear空夹确认计数较低

38个共同有效任务的空夹计数为31 / 41 / 39 / 16。O456相对O1在12项减少、4项增加、22项相同。这是现有核查覆盖内的确认计数，不等同于完整空夹率或夹取能力提升。
指标证据：m05 / m06 / m07。任务来源：deposit_coin、hang_mugs、store_tools_in_toolbox、store_laptop_and_headphones。

### 两个O配置确认的异常碰撞更多

40个共同有效任务中，手臂与物体异常碰撞为2 / 4 / 14 / 12次；39个任务中，双臂异常碰撞为0 / 1 / 5 / 4次。差异有瓶子接近和双臂换手事件的具体来源。
指标证据：m22 / m21。任务来源：put_bottles_into_dustbin、sweep_blocks、insert_key。

### 精细放置失败计数减少，不对应更高任务得分

33个共同有效任务的精细放置失败为23 / 18 / 17 / 14次。O456该项计数最少，40个共同任务均分也最低；局部失误计数不能替代整体任务完成情况。
指标证据：m26 / m02。任务来源：fasten_screws、insert_key、fold_clothes。

## 26项完整统计

每格：合计（任务均值；下界N）。N为同一四组有效交集。

| 指标 | 有效N | Low | High | O1 Compact | O456 Clear |
|---|---:|---:|---:|---:|---:|
| m01 成功 | 40 | 12（0.3；0） | 11（0.275；0） | 13（0.325；0） | 11（0.275；0） |
| m02 得分 | 40 | 14.1（0.3525；0） | 14.25（0.3563；0） | 15.15（0.3787；0） | 13.55（0.3387；0） |
| m03 模型决策轮数 | 40 | 2566（64.15；1） | 2688（67.2；3） | 2647（66.175；5） | 2526（63.15；3） |
| m04 实际环境控制步 | 40 | 22194（554.85；10） | 23581（589.525；12） | 22921（573.025；17） | 19444（486.1；18） |
| m05 空夹 | 38 | 31（0.8158；38） | 41（1.0789；38） | 39（1.0263；38） | 16（0.4211；38） |
| m06 夹取掉落 | 38 | 19（0.5；38） | 26（0.6842；38） | 31（0.8158；38） | 32（0.8421；38） |
| m07 空夹后成功重夹 | 38 | 16（0.4211；38） | 22（0.5789；38） | 12（0.3158；38） | 9（0.2368；38） |
| m08 掉落后成功重夹 | 37 | 11（0.2973；37） | 13（0.3514；37） | 17（0.4595；37） | 15（0.4054；37） |
| m09 直接换手尝试 | 40 | 3（0.075；40） | 4（0.1；40） | 2（0.05；40） | 8（0.2；40） |
| m10 直接换手成功 | 40 | 1（0.025；40） | 0（0；40） | 1（0.025；40） | 2（0.05；40） |
| m11 桌面换手尝试 | 40 | 11（0.275；40） | 9（0.225；40） | 10（0.25；40） | 6（0.15；40） |
| m12 桌面换手成功 | 40 | 11（0.275；40） | 9（0.225；40） | 10（0.25；40） | 6（0.15；40） |
| m13 其他支撑面换手尝试 | 40 | 0（0；40） | 1（0.025；40） | 1（0.025；40） | 0（0；40） |
| m14 其他支撑面换手成功 | 40 | 0（0；40） | 1（0.025；40） | 1（0.025；40） | 0（0；40） |
| m15 同臂补视野 | 40 | 15（0.375；40） | 13（0.325；40） | 18（0.45；40） | 16（0.4；40） |
| m16 异侧手臂补视野 | 40 | 28（0.7；40） | 47（1.175；40） | 32（0.8；40） | 29（0.725；40） |
| m17 靠近动作预算主动放弃 | 26 | 0（0；26） | 0（0；26） | 0（0；26） | 0（0；26） |
| m18 靠近决策预算主动放弃 | 29 | 0（0；29） | 0（0；29） | 0（0；29） | 0（0；29） |
| m19 达到动作预算主动放弃 | 28 | 0（0；28） | 0（0；28） | 0（0；28） | 0（0；28） |
| m20 达到决策预算主动放弃 | 34 | 0（0；34） | 0（0；34） | 0（0；34） | 0（0；34） |
| m21 手臂间异常碰撞 | 39 | 0（0；39） | 1（0.0256；39） | 5（0.1282；39） | 4（0.1026；39） |
| m22 手臂与物体异常碰撞 | 40 | 2（0.05；40） | 4（0.1；40） | 14（0.35；40） | 12（0.3；40） |
| m23 手臂与桌面异常碰撞 | 40 | 0（0；40） | 0（0；40） | 0（0；40） | 0（0；40） |
| m24 非目标物碰倒 | 34 | 0（0；34） | 2（0.0588；34） | 1（0.0294；34） | 1（0.0294；34） |
| m25 选错物体 | 0 | 未知，不填零 | 未知，不填零 | 未知，不填零 | 未知，不填零 |
| m26 精细放置失败 | 33 | 23（0.697；33） | 18（0.5455；33） | 17（0.5152；33） | 14（0.4242；33） |

## 逐项分析

### 总体表现与任务间得失

O1均分领先Low 0.0263、High 0.0225、O456 0.0400。逐任务O1相对Low更高7项、更低4项、相同29项；相对High为10 / 6 / 24，相对O456为6 / 4 / 30。总体优势集中在部分任务，不是所有任务一致提升。

O1在play_Xylophone和sort_nesting_dolls_by_size独自得1分；High在align_blocks和plug_in_charger独自得1分；O456在solve_equation独自得1分。fold_clothes则Low/High各1分、两个O配置各0.2分。不同配置各有强项。

指标：m01 / m02。任务：play_Xylophone、sort_nesting_dolls_by_size、align_blocks、plug_in_charger、solve_equation、fold_clothes。


### 共同成功与共同难点

同分20项包括：7项均成功、10项均零分、3项相同部分得分。共同零分任务为make_kong、make_toast、pick_from_conveyor_by_image、pour_balls_into_vase、pour_by_language、pour_liquid_into_cup、store_tools_in_toolbox、swap_T、swap_blocks、sweep_blocks。

共同成功任务为cover_blocks、general_pickup、match_and_pick_from_conveyor、press_by_number、stack_blocks、stack_blocks_by_language、stack_bowls。相同部分得分为insert_key（0.15）、play_tic_tac_toe（0.1）、put_bottles_into_dustbin（0.4）。同为零分不说明失败机制相同。

指标：m02 / m01。任务：pour_by_language、sweep_blocks、insert_key、put_bottles_into_dustbin。


### 决策与控制投入

决策合计为2566 / 2688 / 2647 / 2526；控制步为22194 / 23581 / 22921 / 19444。High相对Low增加4.75%和6.25%；O456相对O1减少4.57%和15.17%。

决策数包含下界的任务数为1 / 3 / 5 / 3，控制步为10 / 12 / 17 / 18。百分比比较的是发布记录合计，不等于完整动作成本、推理效率、费用或CPU耗时。首轮100决策上限只被O456的4/42项达到；更多失败不能一概归因于耗尽预算。

指标：m03 / m04。任务：fill_pen_holder、play_tic_tac_toe、sort_nesting_dolls_by_size、swap_blocks。


### 夹取失误与恢复

空夹计数为31 / 41 / 39 / 16（N=38），涉及15 / 19 / 15 / 12项任务。掉落计数为19 / 26 / 31 / 32（N=38），涉及12 / 14 / 16 / 15项任务。O456较少的空夹没有伴随更少的掉落。

空夹后成功重夹为16 / 22 / 12 / 9（N=38）；掉落后成功重夹为11 / 13 / 17 / 15（N=37）。两类恢复的事件与分母不保证一一配对，不将总数相除为恢复率。O456 sweep_blocks先掉落、重夹、换手成功，随后再次掉落，最终仍为0分。

指标：m05 / m06 / m07 / m08。任务：sweep_blocks、deposit_coin、hang_mugs。

- o456 / sweep_blocks / broom_drop_01，2.52–2.92秒：失持落桌。原审核视觉依据：扫帚此前随左手离桌；闭爪搬运中柄滑出、翻转落桌，未主动释放。。源帧：head:00063、left_wrist:00063、right_wrist:00063、head:00067、left_wrist:00067、right_wrist:00067、head:00073、left_wrist:00073、right_wrist:00073。原分析SHA：`c01dff6cce6d69336d42e4396a4139e4f3809f17f6fbc7db882c5d7920954321`。
- o456 / sweep_blocks / broom_drop_02，19.68–20.36秒：失持落桌；未恢复。原审核视觉依据：右手此前独立保持并运动，转腕后柄滑出、下坠桌面；右无主动开爪。。源帧：head:00492、left_wrist:00492、right_wrist:00492、head:00494、left_wrist:00494、right_wrist:00494、head:00499、left_wrist:00499、right_wrist:00499、head:00509、left_wrist:00509、right_wrist:00509。原分析SHA：`c01dff6cce6d69336d42e4396a4139e4f3809f17f6fbc7db882c5d7920954321`。

### 直接换手与支撑面换手

直接换手尝试为3 / 4 / 2 / 8，成功为1 / 0 / 1 / 2（N=40），尝试仅涉及1 / 4 / 2 / 4项任务。桌面换手尝试及成功均为11 / 9 / 10 / 6，其他支撑面均为0 / 1 / 1 / 0。

这是已确认事件清单，不能推断桌面换手总体成功率为100%。solve_equation的Low、High与O456均记录桌面换手成功，原生得分分别为0、0、1；O1未记录桌面换手，得分为0。局部换手成功不等于任务成功。

指标：m09 / m10 / m11 / m12 / m13 / m14。任务：solve_equation、sweep_blocks。

- o456 / solve_equation / T1，5.48–9.64秒：One intentional tabletop transfer attempt, successful. Not a drop or recovery.。原审核视觉依据：Right opens 5.48–5.64; disc remains on tabletop while right withdraws 5.88–6.24. Left closes 8.68–9.04, lifts 9.08–9.44, independently carries 9.48–9.64.。源帧：l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:head:0000137、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:left_wrist:0000137、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:right_wrist:0000137、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:head:0000153、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:left_wrist:0000153、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:right_wrist:0000153、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:head:0000219、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:left_wrist:0000219、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:right_wrist:0000219、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:head:0000228、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:left_wrist:0000228、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:right_wrist:0000228、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:head:0000241、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:left_wrist:0000241、l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0:right_wrist:0000241。原分析SHA：`bff134addabaf5b1957adc17939c24187a462a9dbd6e420607dd9d98847356db`。
- o456 / sweep_blocks / handover_success_04，17.28–18.44秒：直接换手成功。原审核视觉依据：右指闭合，左主动开指并撤离；右独立保持扫帚，18.56–18.68继续微移，后续转腕仍保持。。源帧：head:00432、left_wrist:00432、right_wrist:00432、head:00441、left_wrist:00441、right_wrist:00441、head:00451、left_wrist:00451、right_wrist:00451、head:00461、left_wrist:00461、right_wrist:00461。原分析SHA：`c01dff6cce6d69336d42e4396a4139e4f3809f17f6fbc7db882c5d7920954321`。

### 补充视野

同臂补视野为15 / 13 / 18 / 16，异侧为28 / 47 / 32 / 29（N=40）。High异侧计数最多，比Low多19次；逐任务更多8项、更少5项、相同27项。

补视野计数说明策略使用频度，不测量感知质量；未按遮挡机会和执行长度归一化。High的均分与Low接近、成功项略少，不能将补视野频度直接等同于有效感知或因果收益。

指标：m15 / m16 / m02。


### 异常接触与物体扰动

手臂与物体碰撞为2 / 4 / 14 / 12（N=40），涉及2 / 4 / 7 / 9项任务；双臂碰撞为0 / 1 / 5 / 4（N=39），涉及0 / 1 / 4 / 3项任务。

O1 put_bottles_into_dustbin记录4次接近瓶子的接触；O456 sweep_blocks确认两次换手中的双臂异常接触。撞桌均为0（N=40），非目标物碰倒为0 / 2 / 1 / 1（N=34）。掉落、碰撞、碰倒分别定义；候选接触不计入确认数，也不合并为总失误率。

指标：m21 / m22 / m23 / m24。任务：put_bottles_into_dustbin、sweep_blocks、insert_key。

- o1compact / put_bottles_into_dustbin / pink-contact-1，1.12–1.56秒：非预期接近接触使直立粉瓶倒卧。原审核视觉依据：左手打开接近时指面推动瓶身，由直立转横卧，无先行夹持。。源帧：l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000028、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000028、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000029、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000029、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000030、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000030、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000031、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000031、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000032、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000032、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000033、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000033、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000034、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000034、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000035、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000035、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000036、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000036、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000037、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000037、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000038、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000038、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:head:0000039、l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0:left_wrist:0000039。原分析SHA：`40d701bb9b318ed23b2919b1a8ccbb83faec1de1e62e8c3473da12e5ef1da666`。
- o456 / sweep_blocks / collision_01，5.76–6.48秒：碰撞；直接换手尝试1失败并撤退。原审核视觉依据：右腕壳挤靠左腕，左腕及柄被动偏移，撤离后回弹；右未接收。。源帧：head:00144、left_wrist:00144、right_wrist:00144、head:00147、left_wrist:00147、right_wrist:00147、head:00159、left_wrist:00159、right_wrist:00159、head:00162、left_wrist:00162、right_wrist:00162。原分析SHA：`c01dff6cce6d69336d42e4396a4139e4f3809f17f6fbc7db882c5d7920954321`。
- o456 / sweep_blocks / collision_02，8.64–9.32秒：碰撞；直接换手尝试2失败并撤退。原审核视觉依据：右前臂横靠左臂，左臂被动偏移；分离后仍左持扫帚。。源帧：head:00216、left_wrist:00216、right_wrist:00216、head:00221、left_wrist:00221、right_wrist:00221、head:00231、left_wrist:00231、right_wrist:00231、head:00233、left_wrist:00233、right_wrist:00233。原分析SHA：`c01dff6cce6d69336d42e4396a4139e4f3809f17f6fbc7db882c5d7920954321`。

### 精细放置与整体结果

精细放置失败为23 / 18 / 17 / 14（N=33），涉及12 / 9 / 10 / 9项任务。O456确认计数最少，均分排序却不同。insert_key四组均为0.15分，fasten_screws为0 / 0.5 / 1 / 0.2。

尝试机会、执行长度和核查覆盖都可能影响失误计数。减少局部放置失败，不直接代表完成装配；应同时保留原生结果、事件和失败机会。

指标：m26 / m02。任务：insert_key、fasten_screws。


### 预算放弃与不可判定指标

靠近动作预算、靠近决策预算、达到动作预算、达到决策预算的主动放弃，在各自共同N=26 / 29 / 28 / 34内均未确认。未确认主动放弃不等于没有预算上限或系统截断。

选错物体m25的四组共同可判定样本为0，原始任务指令缺失等原因仍保留，不能写成“没有选错物体”。原模型自述、未知值和未覆盖项不补零，不进入客观分母。

指标：m17 / m18 / m19 / m20 / m25。


## 空夹差异来源与证据边界

实际抓取目的的闭合未形成有效夹持才计空夹；推物、按压和空手收爪不计。每次独立尝试只计一次。保留空夹/掉落分类候选，不补造指令或确认帧记录。
相对Low：O456减少11项、增加4项、相同23项；相对High为16 / 7 / 15，相对O1为12 / 4 / 22，均N=38。
下面包含被排除的未知任务，用于核查而不是补入数值分母。Low/High原视频未托管在此预览。

- deposit_coin：O1确认5次空夹，O456为0；重点核对实际抓取闭合与未形成夹持的尝试。
- hang_mugs：O1为5，O456为1；统一空夹、短暂持物后掉落及独立重试的划分。
- store_tools_in_toolbox：O1为4，O456为0；核对零计数是否来自真实无空夹或未覆盖短暂事件。
- make_toast：Low / High / O1 / O456为2 / 4 / 3 / 0；核对跨组覆盖与操作阶段。
- store_laptop_and_headphones：O456为4，高于Low 2、High 0、O1 0；必须同时核对反向差异。
- sort_nesting_dolls_by_size：High空夹未知，不在N=38内；O456存在早期空夹/掉落候选，不能补零或直接纳入。
- stack_blocks_by_language：High首次抓取失败无法区分空夹与短暂遮挡持物，继续排除，不补造确认事件。
- align_blocks：O456工具夹持有空夹候选；推物、按压和空手收爪不应计为抓取失败。

## 40个共同任务原生结果

每格为得分 / 成功标记（1成功，0失败）。

| task | variant | seed / scene | Low | High | O1 Compact | O456 Clear |
|---|---|---|---:|---:|---:|---:|
| align_blocks | standard | 0 / 0 | 0 / 0 | 1 / 1 | 0 / 0 | 0 / 0 |
| arrange_largest_number | random | 0 / 0 | 1 / 1 | 0.15 / 0 | 0.3 / 0 | 1 / 1 |
| classify_objects | standard | 0 / 0 | 1 / 1 | 0.4 / 0 | 1 / 1 | 1 / 1 |
| classify_objects_by_language | standard | 0 / 0 | 1 / 1 | 0.4 / 0 | 1 / 1 | 0.4 / 0 |
| cover_blocks | standard | 0 / 0 | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |
| deposit_coin | standard | 0 / 0 | 0 / 0 | 0.2 / 0 | 0.2 / 0 | 0.2 / 0 |
| fasten_screws | standard | 0 / 0 | 0 / 0 | 0.5 / 0 | 1 / 1 | 0.2 / 0 |
| fill_egg_holder | standard | 0 / 0 | 0.1 / 0 | 0 / 0 | 0.1 / 0 | 0.1 / 0 |
| fill_pen_holder | standard | 0 / 0 | 0.1 / 0 | 0 / 0 | 0.1 / 0 | 0 / 0 |
| fold_clothes | random | 0 / 0 | 1 / 1 | 1 / 1 | 0.2 / 0 | 0.2 / 0 |
| general_pickup | standard | 0 / 0 | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |
| hang_mugs | random | 0 / 0 | 0 / 0 | 0 / 0 | 0.15 / 0 | 0 / 0 |
| imitate_sorting_sequence | standard | 0 / 0 | 0.5 / 0 | 1 / 1 | 1 / 1 | 1 / 1 |
| insert_key | standard | 0 / 0 | 0.15 / 0 | 0.15 / 0 | 0.15 / 0 | 0.15 / 0 |
| insert_tubes | standard | 0 / 0 | 0 / 0 | 0.2 / 0 | 0 / 0 | 0.2 / 0 |
| make_kong | standard | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| make_toast | random | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| match_and_pick_from_conveyor | standard | 0 / 0 | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |
| organize_table | standard | 0 / 0 | 0.75 / 0 | 0.25 / 0 | 0.25 / 0 | 0.25 / 0 |
| pack_objects_into_box | random | 0 / 0 | 1 / 1 | 0 / 0 | 0.1 / 0 | 0.25 / 0 |
| pick_from_conveyor_by_image | standard | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| play_Xylophone | standard | 0 / 0 | 0 / 0 | 0 / 0 | 1 / 1 | 0 / 0 |
| play_stacking_toy | standard | 0 / 0 | 0 / 0 | 0.3 / 0 | 0.1 / 0 | 0.1 / 0 |
| play_tic_tac_toe | standard | 0 / 0 | 0.1 / 0 | 0.1 / 0 | 0.1 / 0 | 0.1 / 0 |
| plug_in_charger | standard | 0 / 0 | 0 / 0 | 1 / 1 | 0 / 0 | 0 / 0 |
| pour_balls_into_vase | standard | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| pour_by_language | standard | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| pour_liquid_into_cup | random | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| press_by_number | standard | 0 / 0 | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |
| put_bottles_into_dustbin | standard | 0 / 0 | 0.4 / 0 | 0.4 / 0 | 0.4 / 0 | 0.4 / 0 |
| solve_equation | standard | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 1 / 1 |
| sort_nesting_dolls_by_size | random | 0 / 0 | 0 / 0 | 0 / 0 | 1 / 1 | 0 / 0 |
| stack_blocks | random | 0 / 0 | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |
| stack_blocks_by_language | standard | 0 / 0 | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |
| stack_bowls | random | 0 / 0 | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |
| store_laptop_and_headphones | random | 0 / 0 | 0 / 0 | 0.2 / 0 | 0 / 0 | 0 / 0 |
| store_tools_in_toolbox | standard | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| swap_T | standard | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| swap_blocks | standard | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| sweep_blocks | random | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |

## O456成功率统计范围

| 范围 | 成功数 / N | 成功率 |
|---|---:|---:|
| 全部已发布结果，含后补devset | 36 / 81 | 44.4% |
| 完整首轮机器人实验 | 11 / 42 | 26.2% |
| 已获批首轮分析 | 11 / 41 | 26.8% |
| 四组共同任务 | 11 / 40 | 27.5% |

push_T原生失败但分析缺失；后补39条成功25条。原实验首轮五能力等权成功率28.3%，不是逐记录等权指标。
O456首轮达到100模型决策轮数的为4/42项，不是大多数失败；达到100轮不自动证明因预算截断。

## 来源与使用边界

所有数值可由four-group-analysis.json、data.json及core.js复算。指标证据链接固定四组共同范围，任务来源保留原分析SHA、当前复核指纹及已公开视频链接。
Low/High审核包含gpt-6-sol与gpt-6.1-sol历史混合；O配置审核为gpt-6.1-sol medium。机器人均为gpt-6-astra；O配置是独立配置，不是只改变effort。
跨组匹配任务不等于控制所有运行条件。本报告为单次首轮描述性观察，不证明因果、多seed稳定性或总体失败率。

## 逐运行来源指纹

### align_blocks / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-align_blocks-standard-s0-scene0`；原分析SHA `3bbb28bd6db3f5c47291d9fda5fbbab22b33cb3127312d2e5df17eacaf9c6990`。
- high：`l3-high-mixed42-20261013-align_blocks-standard-s0-scene0`；原分析SHA `4236601f137e27849a7f947bb5325adf01bb210c887b0b0ee848da117ed2e84e`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-align_blocks-standard-s0-scene0`；原分析SHA `f048e7f990e4dd7e27739e401ab408cc80ad6765ad3cd542d9bb6fece1088494`；当前批准指纹 `3c3b0e412e118c816d1984711eb8b9020a3fe6e20e941eb699ec0a45bbf3bb1f`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-align_blocks-standard-s0-scene0`；原分析SHA `54ae2781c409a0abd7e55ac7eb875bd5e74fb42b548015cdf9afe6b7bb94fa99`；当前批准指纹 `bdf71a4a5f3acb7240045b34d834ebdfc71091846291432136c2f2781e9c8c45`。

### arrange_largest_number / random / seed0 / scene0

- low：`l3-low-mixed42-20261012-arrange_largest_number-random-s0-scene0`；原分析SHA `60f5aac5e39c2821e44ef9d35dc35741774fe0941ab37904897686791f68604e`。
- high：`l3-high-mixed42-20261013-arrange_largest_number-random-s0-scene0`；原分析SHA `4d914a4d71458667465acaa7b26b11aa0432a9f2cb57ec2bfaf3657b5fec7519`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-arrange_largest_number-random-s0-scene0`；原分析SHA `af7c69e9a04d02c40ecab4775c945de53e105dac5125c39600daec3ce7d04fb1`；当前批准指纹 `c5a7c18688bbad238098ed28cdb2523560b69a1a03e1163b508cd38327d4fdf5`。
- o456：`l3-o456-clear-generalization12-20261019-v1-arrange_largest_number-random-s0-scene0`；原分析SHA `06628b6b186d8e6025a12f613e8a0a321ca89bc5b1fcdd27466227c30de6fa25`；当前批准指纹 `cc39dcafb51b40f9bf0a7865ee56d78577522c87cbfe02c89b74ce86dbd95a98`。

### classify_objects / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-init-repair2-classify_objects-standard-s0-scene0`；原分析SHA `ac11e77c81379c1b6523131acec185b802c500e41a30da9ffc097ee7ab86ad97`。
- high：`l3-high-mixed42-20261013-classify_objects-standard-s0-scene0`；原分析SHA `71a3ef940a00efa89027c18d0531c0a5eeaeb7af7af6b955888eea7db6e1d37d`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-classify_objects-standard-s0-scene0`；原分析SHA `256d13a510564192c96fe16bec169c4796afc3b090ee85b57a1b26f1c4391d95`；当前批准指纹 `73984214584486d6742e08d5ccd20f56d84f41737d0faad4b327160cdb594214`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-classify_objects-standard-s0-scene0`；原分析SHA `f1172351aaf9dfb6ff9e8396c72dd5db51073e73aa59e838038857fd0d63bfe9`；当前批准指纹 `c758611367645d907f2c7e47f687af44c2594a219f4bad25e48016e3ff211bce`。

### classify_objects_by_language / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-classify_objects_by_language-standard-s0-scene0`；原分析SHA `bc345d0295cf788e48918b827ec2e0e056220a2aaef83c5cbeae04825af46811`。
- high：`l3-high-mixed42-20261013-classify_objects_by_language-standard-s0-scene0`；原分析SHA `b455b76300c4d950156b4b738728499d180ffe3460e4b593cdc6f7ae6e0ff4ce`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-classify_objects_by_language-standard-s0-scene0`；原分析SHA `a35cb811470d94a6e381b24b2ea3530e7357c15382742cc00a56a3ce12fcd87f`；当前批准指纹 `e0de132f89556e647606ce0ada0ef67bceed8340098a2955677f072211a942e9`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-classify_objects_by_language-standard-s0-scene0`；原分析SHA `46ba6cd92393201fc77996ab66ff49e98c9db43c489766c7c429886fe5cdcbd5`；当前批准指纹 `d2e5b790ac90b3ae8e5abe32b0f066cb18740f52e53ea98530d2d3a6511e3837`。

### cover_blocks / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-cover_blocks-standard-s0-scene0`；原分析SHA `94213d6e03817bf7a085afca5e1d40b4f42ffccfd0daa947a7925466181e6caa`。
- high：`l3-high-mixed42-20261013-cover_blocks-standard-s0-scene0`；原分析SHA `48e3f99d8fea47c2716e3a2ed22badfa91dedfc8e7ee06b1d909f965aab21f5a`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-cover_blocks-standard-s0-scene0`；原分析SHA `53b4ff79f9647a302b712d1bb940528a1cf5c38dca02b3a30e08d8b416d9d08a`；当前批准指纹 `0766528a07776e342f323de640a9eb2e70711d5a126e39f639396eaa5ee5ee72`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-cover_blocks-standard-s0-scene0`；原分析SHA `d2ecaa0354e7e9db2ce8b9f6e8f807e9f518a7ca69fedb048bff2dd42b3fbeb2`；当前批准指纹 `59687b91673379a93575daa368bbc7be72e61ac1e61d4b3a77c0585d539ebefd`。

### deposit_coin / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-deposit_coin-standard-s0-scene0`；原分析SHA `3d99298c0348c3c39589cec000ff199570a3d06346e5fb651c6f922b975eca8b`。
- high：`l3-high-mixed42-20261013-deposit_coin-standard-s0-scene0`；原分析SHA `3af6906280358f4499bcf8b68d61440a85ad2bce91110526a3a11a75c5400346`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-deposit_coin-standard-s0-scene0`；原分析SHA `f70e01c01d0c43df3f67d5b940d39c36d9c429b22801c8a6abcb3bc05717fcea`；当前批准指纹 `01628e0d6be3bc182b65a0e0ad8df002df446c8ba9d3790f3841a1838abc3932`。
- o456：`l3-o456-clear-precision4-20261018-v1-deposit_coin-standard-s0-scene0`；原分析SHA `8560d878ae5206ee24cc530879c7fd5b3d2ecc9357db5bc0b3dab443298409a7`；当前批准指纹 `5fdea4c0fc388220a16677acf6e8df84279725432e2c053ebb428bbfb0aff3de`。

### fasten_screws / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-init-repair2-fasten_screws-standard-s0-scene0`；原分析SHA `2b296968b797591ba38330f17736434bab228fe71744fbf12f61c63b9dc06b74`。
- high：`l3-high-mixed42-20261013-fasten_screws-standard-s0-scene0`；原分析SHA `d72c753851943ba8ad86ed93564d377c47f4dc77e755671cbc51dda80a57c57f`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-fasten_screws-standard-s0-scene0`；原分析SHA `2a1b59638ba38ec16dbfd1a14122feadb142f1e8f4d5a337f7e7677f391bf37d`；当前批准指纹 `59aa03e692f2b1484d5d637012406812f41b152116d61f504f44b87dc3fb7a55`。
- o456：`l3-o456-clear-precision8-completion-20261019-v1-fasten_screws-standard-s0-scene0`；原分析SHA `c6af756fe54ca312ad5bae7f1ece1457f85643b5e01087acbc2a316107f99895`；当前批准指纹 `4a9a6e172ad36bd889e7280097341dd2d9997b2da9696524a4465b9c700a31c1`。

### fill_egg_holder / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-init-repair2-fill_egg_holder-standard-s0-scene0`；原分析SHA `e7539b33c2cae18d3fdac3c53342eba3ab00fd490a91e44b9b3eab70ce9ca03f`。
- high：`l3-high-mixed42-20261013-fill_egg_holder-standard-s0-scene0`；原分析SHA `904378b1f43e56c5758b52cd1272cbf75450ff4b0d6e00d671714389004d38c7`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-fill_egg_holder-standard-s0-scene0`；原分析SHA `f392212f07ebcb43a9323e24753b12f3c24ebe0609ff904225556bf0accb6d84`；当前批准指纹 `bcac23020f5e7cf1271287358c92800abc8cf0735ba3f0fc911febbd97a0ac99`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-fill_egg_holder-standard-s0-scene0`；原分析SHA `0e5b1c07a7cfd4f50cc35cba1cd9bd86ce023557720417d04dbcc910cf3e391c`；当前批准指纹 `d69d87ad84d2a2df22bb1ad2f8d0b567f2e93b09774f953773fac3246c2f7d7f`。

### fill_pen_holder / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-init-repair2-fill_pen_holder-standard-s0-scene0`；原分析SHA `ea4e58a59097bdf6ff1032ecdd37b1ed25f4b6dca40c114ee77894894728d507`。
- high：`l3-high-mixed42-20261013-fill_pen_holder-standard-s0-scene0`；原分析SHA `4ef9e4208c009c33d0b55f757897a999b64aeff8aeab5fe94f7a9e199221f52e`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-fill_pen_holder-standard-s0-scene0`；原分析SHA `3a511a1fd8b5d9c85beb1f948956a9de39477528ec78ed8cc6609416c77b4ca0`；当前批准指纹 `1ecc1b1f597a640156b53ba697afda84c3f955b77b78e0511a58fa0dd5c069e4`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-fill_pen_holder-standard-s0-scene0`；原分析SHA `c2bce60ea452dbb95fb9ad791ae7e66ec34b154525ea56ad2a60b2b0e60771e5`；当前批准指纹 `49cb9c1648c489dedefcbc47c9cee5b938bc9ee24cfeb8d625d89a9c8db35d93`。

### fold_clothes / random / seed0 / scene0

- low：`l3-low-mixed42-20261012-fold_clothes-random-s0-scene0`；原分析SHA `ce1e787e5a1b9728d8c3f233f900732a2b291918c18d8eea3ecc97519fb498a6`。
- high：`l3-high-mixed42-20261013-fold_clothes-random-s0-scene0`；原分析SHA `a5c4a6683c0b99d8bd4712cd579680f0f2e3162444ce9b358bb1853061c2fba1`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-fold_clothes-random-s0-scene0`；原分析SHA `98c40140c99820a1ae3dfa5354787e8c2d3732df246e3fd3ee53e651be77a497`；当前批准指纹 `b63debff76bf1fec97c628b3049c12f81490985c3b1376fec2540b4bb5a8f423`。
- o456：`l3-o456-clear-generalization12-20261019-v1-fold_clothes-random-s0-scene0`；原分析SHA `88e7f32871547c9c496caa71755048d1dda873ec23c48638d4094b4b4f4a4531`；当前批准指纹 `e19a8eaa805402eddcd4e7c2ab94c6ebc96dd34cd2e00f0523abdf93a0bbaff8`。

### general_pickup / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-general_pickup-standard-s0-scene0`；原分析SHA `44153aeb96e6d6ed60d3964850fba9d04e55e997ea190f28a361c75919ffbed5`。
- high：`l3-high-mixed42-20261013-general_pickup-standard-s0-scene0`；原分析SHA `2a7c7131c0873f1e4b02884af8b7a995a84d897870277d84cbcb54da242ca3ab`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-general_pickup-standard-s0-scene0`；原分析SHA `935cb58047887004b4685b660715480c514b98417b546991413f0d2c74b51c1a`；当前批准指纹 `eb01a660b09032ef9629379d502fe8341af2d3fa54654776cfc29339b629a629`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-general_pickup-standard-s0-scene0`；原分析SHA `275b189f6b29080ec0903d64201ad8dd2d318df9e979f322df661d92a5ddeba4`；当前批准指纹 `a7cd149b985aef0ff130c3783bbbc901102736d11107b3bc7741d6781747b331`。

### hang_mugs / random / seed0 / scene0

- low：`l3-low-mixed42-20261012-hang_mugs-random-s0-scene0`；原分析SHA `541bcc46237d4678b38c0b1e2235a304eec3402ede667dbf6c81a8f714612709`。
- high：`l3-high-mixed42-20261013-hang_mugs-random-s0-scene0`；原分析SHA `20e9b2cebe7758d02f0ab639cb6e2b5e112831f0fc63ac5cce193e729294bbe0`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-hang_mugs-random-s0-scene0`；原分析SHA `cf5f27d87465fe6992a01ed9fbdf9b86a9e889cc353b7b92c470920215753c31`；当前批准指纹 `5beafe0c30034633be58f3d73660363e9367e90a37c06e58d4f9d912a564f58d`。
- o456：`l3-o456-clear-generalization12-20261019-v1-hang_mugs-random-s0-scene0`；原分析SHA `ea66150be8c755bf9cfc78a4b0a70ea065e2c567c13aee21003f70db7a370882`；当前批准指纹 `e6269b3fdc47188a535866e5f0c8feff0b86bfff3187c4f7e52c64b1d309660d`。

### imitate_sorting_sequence / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-imitate_sorting_sequence-standard-s0-scene0`；原分析SHA `311573b40736de90a5a63420daacbea0964780c8e82962686813d55d2747e17b`。
- high：`l3-high-mixed42-20261013-imitate_sorting_sequence-standard-s0-scene0`；原分析SHA `a902fce13c6794ccb7fedfdeeb8c954bb83906f1bdb5bd36c207dccb1ab851d4`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-imitate_sorting_sequence-standard-s0-scene0`；原分析SHA `341a424115acb1c166cc9b362f13719d00b83a3ab1d51c931f73047ccd5a5388`；当前批准指纹 `3450a953aa196c08e1786720e82d4f57e67cb8a429f7b0b39ab3ad9a5b1efac5`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-imitate_sorting_sequence-standard-s0-scene0`；原分析SHA `1b7024f2f2b029a8a8958dec505bd067dc022ba2efadb1216ce8ba358095d293`；当前批准指纹 `a32197de7d9e9af1b0585e418bf14cb0a6c71776282254a60ce243318fb6952a`。

### insert_key / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-insert_key-standard-s0-scene0`；原分析SHA `b9e04487cda42557c8793df71650a595ac9b3adf5bf1f9b3ee5fb7c9042248d5`。
- high：`l3-high-mixed42-20261013-insert_key-standard-s0-scene0`；原分析SHA `cb3dbe1ed91a40f8c81f33b144ba6ef96cc696f962e795d51162573251b3436c`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-insert_key-standard-s0-scene0`；原分析SHA `6093f00d1d299694606d6cbc114534c8a3936cd585ae04bcf736797a85203c44`；当前批准指纹 `d6dede2242b6626e564d2af40124ee395543c456e4348bbf3c5ceb54cddf2b4a`。
- o456：`l3-o456-clear-precision4-20261018-v1-insert_key-standard-s0-scene0`；原分析SHA `f1999f9706fd10561a2f55945c1058fcd4b514bc9daa91c2724777854d7a761c`；当前批准指纹 `238878b08beb7082253edf6eca45bce0716aac3b3b34f82ca5019382ebaa28ef`。

### insert_tubes / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-insert_tubes-standard-s0-scene0`；原分析SHA `53463116b4d40f9fc24d29e2093fb53ffa0f1bff03379185c106a6a436aaee00`。
- high：`l3-high-mixed42-20261013-insert_tubes-standard-s0-scene0`；原分析SHA `bdbb7591aa0975513f270c2a966d1c2d9a81df09cc588c24d7a14eca3fe023a2`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-insert_tubes-standard-s0-scene0`；原分析SHA `d4420b16a5bde3fd25ac1acc099ee37ae0c84fb12cb2e6eb71d8ff6602727c92`；当前批准指纹 `1392b27bee64e8a02dee00ed1fc96dec08e872b59663b1e69957948d89927513`。
- o456：`l3-o456-clear-precision4-20261018-v1-insert_tubes-standard-s0-scene0`；原分析SHA `17180e960871a396adcdca4cd305f31bc4ad4f4ebcc26076bbb54f3a734e3092`；当前批准指纹 `979001c788c68317c71ca62e221ca1ddcd5170a2d126bb03cf5c7c1f9344c938`。

### make_kong / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-init-repair2-make_kong-standard-s0-scene0`；原分析SHA `75ca413fbc7aa8a8251e6f940a43c84667ee3c75e694ed05bb0f9083a147f045`。
- high：`l3-high-mixed42-20261013-make_kong-standard-s0-scene0`；原分析SHA `09e7e0627bb5d3aee7ffa4e18741fe9259698b7f8a9aa38b14ec040e9445f694`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-make_kong-standard-s0-scene0`；原分析SHA `52577f9ffe7dfc2f6faf9c385febb276c1ddd4ae28e201516de8aea5412c17b8`；当前批准指纹 `e42365285ea8e941804d80f4013af6d7693d7630fbdf411da2138147ba4cafa8`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-make_kong-standard-s0-scene0`；原分析SHA `6e37d8ab99afe47cfea653798fc7a3f6dc90ca31722539c20510020c76d44ecb`；当前批准指纹 `bcd3b1915bf0cbca62320c64fcf76d78686a4f87b48ddf486724f6f88dc0f554`。

### make_toast / random / seed0 / scene0

- low：`l3-low-mixed42-20261012-make_toast-random-s0-scene0`；原分析SHA `185b5913e859f45a703ae965f1c278abc70522b7699cfed0fb4842bb7b8194c7`。
- high：`l3-high-mixed42-20261013-make_toast-random-s0-scene0`；原分析SHA `3bbf3f789f463c179b81eb1e825a4bbcd9258afdcb7a80000b7ba050350687be`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-make_toast-random-s0-scene0`；原分析SHA `8fa138a276d5484bb5608906753e0a301805bb0fa29ac8299ef6bb37f56d6f84`；当前批准指纹 `abd612cf0b348960660ce257da09c9d21cc045fb488c493344afa0bb657a50e9`。
- o456：`l3-o456-clear-generalization12-20261019-v1-make_toast-random-s0-scene0`；原分析SHA `72e3767ebb0c8fbefdc4d71d7a9901d198af4cf04b0c2e12c70f37ec5add27cd`；当前批准指纹 `e1c5932ce573d67fe95ea54026377bb477eb2732c8ce78fb0bdef99a15a834ab`。

### match_and_pick_from_conveyor / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-match_and_pick_from_conveyor-standard-s0-scene0`；原分析SHA `dc4d74de42e676f1c3de909a827d0bc9bd93cb15b34b347c1d925929b0cb6c97`。
- high：`l3-high-mixed42-20261013-match_and_pick_from_conveyor-standard-s0-scene0`；原分析SHA `973bdd2b9981e9859b30a8b2e9816672984ef0d1db8f57e0745c57ba2f3ea68f`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-match_and_pick_from_conveyor-standard-s0-scene0`；原分析SHA `efc88f60d6e28e51573cadafcbc428e48df11887869a234bab6f7d33c6eafc78`；当前批准指纹 `042ef97ff878b13f08816c8ab7fafb7906751bb46db00b74ebc7bbed475621b3`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-match_and_pick_from_conveyor-standard-s0-scene0`；原分析SHA `e69d516a0e50cedee9e4798d3eb2eb36ddada03e60909439b5ff368d0602c859`；当前批准指纹 `b128139a2ffd2ab060dcec60b6808af571643580fc48393a6d2676440076f2ff`。

### organize_table / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-init-repair2-organize_table-standard-s0-scene0`；原分析SHA `a6e8191304b091997153d70dc5c5dfd715c1faa5c2b4582c77fe9541a0d59d4a`。
- high：`l3-high-mixed42-20261013-organize_table-standard-s0-scene0`；原分析SHA `273eec1574252aa1694e28be21a393151f10a06c0b35c4a456421ce107f48de9`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-organize_table-standard-s0-scene0`；原分析SHA `8b829a010795f9e2f5d1aa17ff681f9055035717ae8126e6c8623356ab17e428`；当前批准指纹 `2315ccf6e3513cf07eb210d176b4ba4e29a3f3ae1b13fa25de31ca2cb6e11de7`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-organize_table-standard-s0-scene0`；原分析SHA `c31e99eeeefd44439727bad611eab798bd67300e82df8e258172544ce07f4e88`；当前批准指纹 `e9512e5cac0f92f1f2bfe2a6e1a9ba012282c82c608a2e5593aea18392addd93`。

### pack_objects_into_box / random / seed0 / scene0

- low：`l3-low-mixed42-20261012-pack_objects_into_box-random-s0-scene0`；原分析SHA `bfeb795baa8d29e4df5f4f840825cf2925ea2476a35d578c09ad9f3ebbc4f566`。
- high：`l3-high-mixed42-20261013-pack_objects_into_box-random-s0-scene0`；原分析SHA `b9d8c5c0ef8cd3d22d0586f765076905768538cff60909986ae2a65a5f89dfd4`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-pack_objects_into_box-random-s0-scene0`；原分析SHA `71437946288ccd56ae95f314bb7d31abb04bac692a3d5e76237eb348629c2d1a`；当前批准指纹 `fe2be4a4802607b11c2f40d6079efbc5708c29e5a3d9a267bd2b0de354980788`。
- o456：`l3-o456-clear-generalization12-20261019-v1-pack_objects_into_box-random-s0-scene0`；原分析SHA `c71e8d79edc59f86e079d5292c078b6a758e4a3dc0312bcac1a1643aca93bb6d`；当前批准指纹 `17d228d6a2b190170cd0161b27e7307e88ad28fa53515b8e34e7b9cb7a788763`。

### pick_from_conveyor_by_image / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-pick_from_conveyor_by_image-standard-s0-scene0`；原分析SHA `be9ba2d7b32bf3ea7f192ce289e217371d6fe9a7f827b67b31d48c5594befbd1`。
- high：`l3-high-mixed42-20261013-pick_from_conveyor_by_image-standard-s0-scene0`；原分析SHA `070439b0af76447c57eba9699547a691c043227705e2320dc42c87c74b83111e`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-pick_from_conveyor_by_image-standard-s0-scene0`；原分析SHA `2204a37d71e26ab143a0c97fd7be239e0efcefecc6bb6cb978ee85a96ad6f116`；当前批准指纹 `c359a540584d288918aef1f79f99ab417baab773f873a163873434a901f646e8`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-pick_from_conveyor_by_image-standard-s0-scene0`；原分析SHA `9b1740cf90525093970ebcf1cf52c965ccf1d369be31cfe49c1faf22ef281afd`；当前批准指纹 `c1df4b9365b14c552ed448a6b2086647e58a8190360d44bebf6da08c31be0afc`。

### play_Xylophone / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-play_Xylophone-standard-s0-scene0`；原分析SHA `94bd08a941112d50740ac12afe082e8d71b9d3f040fb193c180494d72733276b`。
- high：`l3-high-mixed42-20261013-play_Xylophone-standard-s0-scene0`；原分析SHA `8596808d2ddbd4af394862007a36929c8acd59f0f6dbf87c8a7015d1f2be9358`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-play_Xylophone-standard-s0-scene0`；原分析SHA `0df0653068a83a213fe7d4fed1f738d0eac317211b86e86e7c9a7d14ec9f6ca5`；当前批准指纹 `e5c8d1e261fb6e7b512b584c005e66dbb34deec3ccbeaf35000b7278b9efd3a6`。
- o456：`l3-o456-clear-precision8-completion-20261019-v1-play_Xylophone-standard-s0-scene0`；原分析SHA `8c2ee5998806dbf1538daadf7a9938df6bd3bf692a87296ab6d4377eb5e2a63a`；当前批准指纹 `a38b2a53845e21c38538db154ac04ba69a2e3de7a0273d31de526059f752dfad`。

### play_stacking_toy / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-play_stacking_toy-standard-s0-scene0`；原分析SHA `52293369a2fe94a261a50c76c9a8fd9bbee97e23d537a834ab0835ce48414b82`。
- high：`l3-high-mixed42-20261013-play_stacking_toy-standard-s0-scene0`；原分析SHA `d5501f0b71c716f447e6d077ef4845ab415ed1c81430129fec4c87df2ad3835c`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-play_stacking_toy-standard-s0-scene0`；原分析SHA `a5eb371ccd0f2b424160abbe57ecaa767a768b8b55a37ddda1f26546dcfae64c`；当前批准指纹 `6fc275c440515b9c30a36b069eed401155e7ac544021ab25c3215b889b542f20`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-play_stacking_toy-standard-s0-scene0`；原分析SHA `c2647393e18d33ad2343cd3edf053ea880aaef10f1313df2c429e705feb8e7ae`；当前批准指纹 `1846d9c25ac72f40baa25901f1c7c38beae24f148c65fd344c081e4cdf3dd865`。

### play_tic_tac_toe / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-init-repair2-play_tic_tac_toe-standard-s0-scene0`；原分析SHA `5eb05f7410f2326854560f47cf43c0f37d69723b64e468bc4636b300fec70651`。
- high：`l3-high-mixed42-20261013-play_tic_tac_toe-standard-s0-scene0`；原分析SHA `7da83cfc832b00baf7efc19313013bde5a90e750199f544bcc6e65690b50a66c`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-play_tic_tac_toe-standard-s0-scene0`；原分析SHA `20ad41e7b4886a8724304cc34047d2135f984807cacc9d55a8f9d8b4cfc6bbe3`；当前批准指纹 `b42712eed9bfd390fe0c5c5b0c0e128d49c52dd9c28c7722b0f57c69b7c38ca8`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-play_tic_tac_toe-standard-s0-scene0`；原分析SHA `55d765f725f51e1c4d80f64000570ea386a14e59edc9b981a33c9996132ca5f9`；当前批准指纹 `a4a6929b4dfbcd8f669601874ab2c3717b47ca3200d89bb66097ce0d0e9fec54`。

### plug_in_charger / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-plug_in_charger-standard-s0-scene0`；原分析SHA `705c2f00b3108cb6c4baa3b2916e19a5cf3a9c8cfee49846cf2dfc9dbba1d7c9`。
- high：`l3-high-mixed42-20261013-plug_in_charger-standard-s0-scene0`；原分析SHA `26b30f90b2b2d8ef5ec2c615698e8f05c8c55c6e6ff342789d42ec428ebea9da`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-plug_in_charger-standard-s0-scene0`；原分析SHA `aabbd930b33d6e0686279bd1d947e56f5f24180c368ad03c8b615027def1c06a`；当前批准指纹 `036d70b9c81e7e69d73ccca094b2d2bcd65fee56a0dd6deca1f9d36ed9a2f14f`。
- o456：`l3-o456-clear-precision4-20261018-v1-plug_in_charger-standard-s0-scene0`；原分析SHA `216ae066aba94c8aaa575e46be85bfe0e1fabe1971fe38dd911733e6a845c460`；当前批准指纹 `508cd7db4fe07f145da2c3f9f1c3cc403d6f6c6ce717891382c400c37190a2ea`。

### pour_balls_into_vase / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-pour_balls_into_vase-standard-s0-scene0`；原分析SHA `c2778b69355c8b653d6695f1f097e2252e76ffa017ce05144d7efda03f300659`。
- high：`l3-high-mixed42-20261013-pour_balls_into_vase-standard-s0-scene0`；原分析SHA `fa1c86c13a4016b29105dad9b05b3351655a53534169a0c8763c9ff4e6a970a0`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-pour_balls_into_vase-standard-s0-scene0`；原分析SHA `d1915d80da37f16ae983b441186108997a8ce299f0d560914e41ec1c23348d7c`；当前批准指纹 `1237f6435a3c83c5c6b7a9184b1fb5b94dca3296d4bee4e57189f76873c96c6f`。
- o456：`l3-o456-clear-precision8-completion-20261019-v1-pour_balls_into_vase-standard-s0-scene0`；原分析SHA `708f5d55eb8f226ed71c293fb0d039dd532eb137a93119838a8371bc3aa16766`；当前批准指纹 `c98aeaadedc1945fc790b6c6d91cda4a864f9c99fab3516418b28f45b43cbea9`。

### pour_by_language / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-pour_by_language-standard-s0-scene0`；原分析SHA `cf8a872ef4fa103463d7d35b853aaac591663b688d33890343e014be229bba7b`。
- high：`l3-high-mixed42-20261013-pour_by_language-standard-s0-scene0`；原分析SHA `969f59edcc5c0ea89d14dedf9e9f663716ac8e279f8eb0f785a3562b5f849522`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-pour_by_language-standard-s0-scene0`；原分析SHA `782ac617f0809d253d2dd70f5a77f81c261307f5e44bef12a7ba253cac732a2b`；当前批准指纹 `daa5532e16b40cebfb6b193734bd7a77581561c0b40f032f5cfdbde039bf3c80`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-pour_by_language-standard-s0-scene0`；原分析SHA `6aa46c908b3365a60b21ec9331db6e6fd388ac7219fc1b2adfb578f3864724af`；当前批准指纹 `c4627b5ce450209ba1e3db3c9c9fb999d43c82d57eaa5bb2265d93fcb4f602dc`。

### pour_liquid_into_cup / random / seed0 / scene0

- low：`l3-low-mixed42-20261012-pour_liquid_into_cup-random-s0-scene0`；原分析SHA `79940637a758c3260639354e3f359fb004fcf9a88306585bdd7156b4f042a33a`。
- high：`l3-high-mixed42-20261013-pour_liquid_into_cup-random-s0-scene0`；原分析SHA `c41d4908933778420d6247ecfccf68cce2c4529c9fb110487e2d144bdf8111c0`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-pour_liquid_into_cup-random-s0-scene0`；原分析SHA `43289902fc7ad3e5db8158181189bfaba37da82cfa16ca0e6394e71185417965`；当前批准指纹 `358a05afc0f063348eb91a3dfbdce433056fb1bd7862ab840605017c4d42e0a0`。
- o456：`l3-o456-clear-generalization12-20261019-v1-pour_liquid_into_cup-random-s0-scene0`；原分析SHA `14035906e0f271fe575348fb485d63d8f8e3a948f4a920091359a856284d382d`；当前批准指纹 `81a6fb833e6f3a310dff8f50d64ea3e972ca35327725076429c36bda07156412`。

### press_by_number / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-press_by_number-standard-s0-scene0`；原分析SHA `e407995315a0c58b7b22a83be58b34303aa5794de355c27af9a02128fa784b31`。
- high：`l3-high-mixed42-20261013-press_by_number-standard-s0-scene0`；原分析SHA `0264baaa076f18f895516fe43c7c818dfd3256af196c392297b869c7fe022743`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-press_by_number-standard-s0-scene0`；原分析SHA `97bb67775b7dbb1b9b0087d04a899cde326fa25a5bdd08e4186aca50cfea3267`；当前批准指纹 `ead00f2ff86d7d0113e04fc792be04ff61d6d5a4aa0c753a6b84de378a0e5b3b`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-press_by_number-standard-s0-scene0`；原分析SHA `0ed995266e060f5a94c7be4ceed3461ddf0519cc108cce0cb43d99b0aa312e1c`；当前批准指纹 `559677a72ccf48679e60cf8a08befde712211d63a70bb6be31f538269b8512db`。

### put_bottles_into_dustbin / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-init-repair2-put_bottles_into_dustbin-standard-s0-scene0`；原分析SHA `017b98d24303639d69278a9e73d7f6225e0a168d8f4a2a92d6af3966ce48c29f`。
- high：`l3-high-mixed42-20261013-put_bottles_into_dustbin-standard-s0-scene0`；原分析SHA `d8f32ba2bb86b4ebe695da06793920a820d8ec40eae269eb97564d4d0f6a0b22`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-put_bottles_into_dustbin-standard-s0-scene0`；原分析SHA `40d701bb9b318ed23b2919b1a8ccbb83faec1de1e62e8c3473da12e5ef1da666`；当前批准指纹 `b91fb2da070c63ef3e0ac358a010d092ab348b2e99b39a96e50e9d1d6e9e68f9`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-put_bottles_into_dustbin-standard-s0-scene0`；原分析SHA `119be55ddcdb7efd5df0e06a175ecf07e161e8a80f73817642e49fd9765cae09`；当前批准指纹 `8baadf68750cef0663c364c83794a4efeaaecce8cd77ebbfe3bf18a8b91069df`。

### solve_equation / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-solve_equation-standard-s0-scene0`；原分析SHA `d03d3f71150dc5344647d7f77d82d9c218dcdb50c21593b27116fd01075bd891`。
- high：`l3-high-mixed42-20261013-solve_equation-standard-s0-scene0`；原分析SHA `fd6b471fb200e72af2957323bc278fe5e5aaa8c4ce513410dec8024e5587ae0c`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-solve_equation-standard-s0-scene0`；原分析SHA `b8606a824101c8b53102d237a599ea7c54bf79fe01500b93d89f37874498a95b`；当前批准指纹 `47969d35da2c68ea94b3dc6810299af988afdf7e4771dfd36cfdf02ca93c45df`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-solve_equation-standard-s0-scene0`；原分析SHA `bff134addabaf5b1957adc17939c24187a462a9dbd6e420607dd9d98847356db`；当前批准指纹 `f771194cc66f37c22c21d8066143ce6d1d9d8d14128d00c03abb339448203d4a`。

### sort_nesting_dolls_by_size / random / seed0 / scene0

- low：`l3-low-mixed42-20261012-sort_nesting_dolls_by_size-random-s0-scene0`；原分析SHA `bb8fb7d590ad47de0cf31d723635de7bc86f5328ddddea23e7d75fd01903b47c`。
- high：`l3-high-mixed42-20261013-sort_nesting_dolls_by_size-random-s0-scene0`；原分析SHA `cbd929612a3c517c17f37e3b2ae9be8f698b006d2d8835214be27fee225a7a81`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-sort_nesting_dolls_by_size-random-s0-scene0`；原分析SHA `023b56f7a28e5cca4c74935f37a76c9f2a758b74bca7935e2cd32004e438bf83`；当前批准指纹 `9e032f9af75fd77aa5a3f82e558347a12b8c8d70168c3ea124d2dc16de24a468`。
- o456：`l3-o456-clear-generalization12-20261019-v1-sort_nesting_dolls_by_size-random-s0-scene0`；原分析SHA `c1336bfd1d26a53c7683561f6b74331945f4fff8d9b97b9943395ddc7677955c`；当前批准指纹 `b1b42b754af68fbe71cf171d59c9799d576ee5b97d2aed7b9c5d5025f71bc551`。

### stack_blocks / random / seed0 / scene0

- low：`l3-low-mixed42-20261012-init-repair2-stack_blocks-random-s0-scene0`；原分析SHA `3c06b02ff6704a44c71d119e7aafe9c43e94e4cf8743966825a3588342d9ef03`。
- high：`l3-high-mixed42-20261013-stack_blocks-random-s0-scene0`；原分析SHA `f70a5fffd39015cde7b3b1b1fbe987b0a534a5610f25fb6ecd253cbf90a0ff68`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-stack_blocks-random-s0-scene0`；原分析SHA `88da843d3e4707421994e6301a44b4c3da5d15fd22ae5dd1237d5ed93ded5f64`；当前批准指纹 `f82b4a8289768dbca86d274582354cff6e41a9663ff6ba7a8b59c5b2ead6201b`。
- o456：`l3-o456-clear-generalization12-20261019-v1-stack_blocks-random-s0-scene0`；原分析SHA `84accc4e9e4f32bebbc2e2fea151b097582e58e0a26be6fa774f616e1483e42d`；当前批准指纹 `a9ff81b9661dafd8715851fc5f99bf1c1a7b97789fb559691946e0705110f3c4`。

### stack_blocks_by_language / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-stack_blocks_by_language-standard-s0-scene0`；原分析SHA `f98151cf4d8a33ff209d4de2009f1e3bdaec0c13efe59ac480436da5904c8c6d`。
- high：`l3-high-mixed42-20261013-stack_blocks_by_language-standard-s0-scene0`；原分析SHA `051470dd3df2b3668ea4a4e09395c0968a19572ffb5d92efa96a4d09c140418c`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-stack_blocks_by_language-standard-s0-scene0`；原分析SHA `4e3b039751ffbb5ab6177f6b132d01a22e2c7a0b3623f36caa0e48a11ce8a679`；当前批准指纹 `a326021278ec213feb15f82b4c642585dfab54454cb3285f5e421a187c2ba596`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-stack_blocks_by_language-standard-s0-scene0`；原分析SHA `fcee984a98bb7a0201f2968a5c7c1b62e5bb5fe83bbc06b65971effc1f367180`；当前批准指纹 `9f34052b915a2f812a4c9d403a09a1a5f08b8bfb56af69550696c008d043e267`。

### stack_bowls / random / seed0 / scene0

- low：`l3_low_stack_bowls_random_s0_scene0_20261012`；原分析SHA `bdd12cf084201cd9528f1d53b0a9a6aa73228b4c4563857c6a7c31c0ac7b2263`。
- high：`l3-high-mixed42-20261013-stack_bowls-random-s0-scene0`；原分析SHA `442f9748c002779b9a86432aeb69f0bbc7b35606f5383721ea28f5d5a3d481c0`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-stack_bowls-random-s0-scene0`；原分析SHA `613444ae270e2fa89990e1da96b92fcd58ed61bd77fd06b1a742d8cc335473d7`；当前批准指纹 `beb14852dafbf9416d77e4db965569046ff98142bc681d2172660859e09b010a`。
- o456：`l3-o456-clear-generalization12-20261019-v1-stack_bowls-random-s0-scene0`；原分析SHA `0ca34a18ecbc4e6a2d0b5d045e81d8a8e83fef7421b6b68456efbeca86711f78`；当前批准指纹 `af83b1b32f5085e0a271f0e8459bc4774ee144a38e8fd59a378302e0ae208de1`。

### store_laptop_and_headphones / random / seed0 / scene0

- low：`l3-low-mixed42-20261012-init-video3-store_laptop_and_headphones-random-s0-scene0`；原分析SHA `d5540368b6c94a2aee87b70dcb43a840fbb6228c2d22e2304bc47ed10a3329c4`。
- high：`l3-high-mixed42-20261013-store_laptop_and_headphones-random-s0-scene0`；原分析SHA `691289b416965cc393026608fedcb4a7e68de448a7f3da11d7d4c4d0b3c4c451`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-store_laptop_and_headphones-random-s0-scene0`；原分析SHA `d745e9ab6d6af9ebea0399310580985713d785b61ced50fd36ad0e58b1a47f74`；当前批准指纹 `2392e87794dcbb4a483aab4ada23c46522473043c763118ff79cac9f9956bc53`。
- o456：`l3-o456-clear-generalization12-20261019-v1-store_laptop_and_headphones-random-s0-scene0`；原分析SHA `5dd1899cfc77b99a2a37482436f36908224574dbbccd388e96dd252c16fdecc8`；当前批准指纹 `977714b0d4da24295000f4c2e3a293dff6a2e337f8897162463adddd338bc0cb`。

### store_tools_in_toolbox / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-store_tools_in_toolbox-standard-s0-scene0`；原分析SHA `5c20c9a0f2cff11ce1e627feaae65ade27af6f0de1b4d2abcab844f851987e39`。
- high：`l3-high-mixed42-20261013-store_tools_in_toolbox-standard-s0-scene0`；原分析SHA `8ae7e74b15425fd4c54dc0eeeee0341bb2ce83f65409659f7211eb66ca87fd38`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-store_tools_in_toolbox-standard-s0-scene0`；原分析SHA `5d4eca66d896b33db8c36f76212bb99089515811f7640a3f4c5f82003c1e022d`；当前批准指纹 `70038541adc901308cb6f5924554772b44eb3a68735666b56957278e1350e09d`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-store_tools_in_toolbox-standard-s0-scene0`；原分析SHA `97f63aea6d67c925877a7f9633390caab4ff0ff04de02adb37315558fa18690e`；当前批准指纹 `2dbd90b7b8f4efefc09f0d610b2408715303d5b2a8040baf1dda379ff6353df3`。

### swap_T / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-swap_T-standard-s0-scene0`；原分析SHA `99933f4e9b46f827cdcbf5fcc05301390da90410c19bb17b0dca4df7c19684c6`。
- high：`l3-high-mixed42-20261013-swap_T-standard-s0-scene0`；原分析SHA `dd26bb9a5605d68d145d62463248a9ac6acb28ed9c61c4856390d61ceffafd5d`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-swap_T-standard-s0-scene0`；原分析SHA `93de128828a38839715a7df0aa5d79a148da9a36b5d3cd015b61a27d0835b07d`；当前批准指纹 `38d4a19ce03f0e03fc131b77c93f65133019b23cf219b66a6a4171fbc9f105f9`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-swap_T-standard-s0-scene0`；原分析SHA `3197c0b474dc961251c3e99f5c926769057e23f9bc4a540020126bad9a2730b8`；当前批准指纹 `ab29a060ee36d5a721a3845da24f8b59bf3125e7c114f48dad860a990c46b7ba`。

### swap_blocks / standard / seed0 / scene0

- low：`l3-low-mixed42-20261012-swap_blocks-standard-s0-scene0`；原分析SHA `87b3d185713d3cfe732a3957950efb6812589d0f86c833e8f240206e3eb5b457`。
- high：`l3-high-mixed42-20261013-swap_blocks-standard-s0-scene0`；原分析SHA `ef7bc18f84daa2e7709c4b23379682882d40f200d55cdecd06a3caffeba0b5e5`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-swap_blocks-standard-s0-scene0`；原分析SHA `65edc036e7fec5d1b022f4859f421c1e0e2839aef22505e678789a56cb7cc4a7`；当前批准指纹 `2410fa460e965f745410860626d6cca8410799883b40b816ab37c68ef0aa6654`。
- o456：`l3-o456-clear-olm22-medium-r1-20261019-swap_blocks-standard-s0-scene0`；原分析SHA `7f68de5b1e68c1109981a2d3186550d69209298022da9b545eb2627a9d5039d0`；当前批准指纹 `d8731b5f9c78840939f6916a208f7fda4efbf4ceca6b3f345ced3ef9132c8316`。

### sweep_blocks / random / seed0 / scene0

- low：`l3-low-mixed42-20261012-sweep_blocks-random-s0-scene0`；原分析SHA `bb9d341631ad2b5eb0f996e073a242a99238806edcbba2cc50537a35e7f288f2`。
- high：`l3-high-mixed42-20261013-sweep_blocks-random-s0-scene0`；原分析SHA `6c34ad0a3a8f82721598bd90252f630d3a5ec873da121b906062d2eee2674104`。
- o1compact：`l3-o1-compact-precision4-20261017-v1-sweep_blocks-random-s0-scene0`；原分析SHA `63ebcdd8716ee3192a0791077197a887864c15cd2e8d578eaa4747e8f6acc1ca`；当前批准指纹 `86476514e6d4f93e1da9320eee26310ea22cbc14be10427a90c99eaa6a6c9a29`。
- o456：`l3-o456-clear-generalization12-20261019-v1-sweep_blocks-random-s0-scene0`；原分析SHA `c01dff6cce6d69336d42e4396a4139e4f3809f17f6fbc7db882c5d7920954321`；当前批准指纹 `35f9209316e5910a31a637e59010d46ff20a4b327171abea18002d46fe01017d`。

