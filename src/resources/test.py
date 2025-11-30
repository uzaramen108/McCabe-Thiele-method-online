import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_final_adjusted_diagram():
    fig, ax = plt.subplots(figsize=(16, 10))
    
    # 캔버스 설정
    ax.set_xlim(-2, 19) # 왼쪽 여백 확보 (글자가 길어서)
    ax.set_ylim(0, 11)
    ax.axis('off')

    # 스타일 설정
    box_width = 1.6
    box_height = 1.0
    
    # 함수: 블록 그리기
    def draw_block(x, y, text, color='white'):
        rect = patches.Rectangle((x, y), box_width, box_height, 
                                 linewidth=1.5, edgecolor='black', 
                                 facecolor=color, zorder=5) 
        ax.add_patch(rect)
        ax.text(x + box_width/2, y + box_height/2, text, 
                ha='center', va='center', 
                fontsize=14, fontweight='bold', 
                color='black', zorder=10)
        return (x + box_width, y + box_height/2)

    # 함수: 화살표 그리기
    def draw_arrow(x_start, y_start, x_end, y_end):
        ax.annotate("", xy=(x_end, y_end), xytext=(x_start, y_start),
                    arrowprops=dict(arrowstyle="->", lw=1.5, color='black'))

    # 함수: 선 그리기
    def draw_line(x_start, y_start, x_end, y_end):
        ax.plot([x_start, x_end], [y_start, y_end], color='black', lw=1.5)

    # 함수: 직각 화살표
    def draw_ortho_arrow(x_start, y_start, x_end, y_end, mid_x=None, direction='h_v'):
        if mid_x is None: mid_x = (x_start + x_end) / 2
        if direction == 'h_v': 
            ax.plot([x_start, x_end], [y_start, y_start], 'k-', lw=1.5)
            draw_arrow(x_end, y_start, x_end, y_end)
        elif direction == 'v_h':
            ax.plot([x_start, x_start], [y_start, y_end], 'k-', lw=1.5)
            draw_arrow(x_start, y_end, x_end, y_end)

    # 함수: 합산점
    def draw_sum(x, y):
        circle = patches.Circle((x, y), 0.2, edgecolor='black', facecolor='white', lw=1.5, zorder=5)
        ax.add_patch(circle)
        return (x, y)

    # --- 좌표 정의 ---
    y_top = 8.5
    y_bot = 2.5
    
    # 1. Inputs (수정됨: 텍스트를 화살표 왼쪽에 배치)
    # Nitroprusside
    ax.text(0.5, y_top, "Nitroprusside", ha='right', va='center', fontsize=14, fontweight='bold')
    draw_arrow(0.6, y_top, 1.8, y_top) # 화살표 시작점 조정
    sum_err_1 = draw_sum(2, y_top)
    ax.text(1.6, y_top + 0.3, "+", fontsize=12)

    # Dopamine
    ax.text(0.5, y_bot, "Dopamine", ha='right', va='center', fontsize=14, fontweight='bold')
    draw_arrow(0.6, y_bot, 1.8, y_bot) # 화살표 시작점 조정
    sum_err_2 = draw_sum(2, y_bot)
    ax.text(1.6, y_bot + 0.3, "+", fontsize=12)

    # 2. Controllers
    gc1_out = draw_block(3, y_top - 0.5, "$G_{c1}$")
    gc2_out = draw_block(3, y_bot - 0.5, "$G_{c2}$")
    
    draw_arrow(2.2, y_top, 3, y_top)
    draw_arrow(2.2, y_bot, 3, y_bot)

    # 3. Decoupler Sums
    sum_u_1 = draw_sum(8.5, y_top) 
    sum_u_2 = draw_sum(7.5, y_bot)

    draw_arrow(gc1_out[0], y_top, 8.3, y_top) 
    draw_arrow(gc2_out[0], y_bot, 7.3, y_bot) 
    
    # M1, M2 Labels (수정됨: M2를 점 아래로 이동)
    ax.text(5.0, y_top + 0.3, "$M_1$", fontsize=14)
    # M2 Label moved below the line
    ax.text(5.3, y_bot - 0.4, "$M_2$", fontsize=14) 

    ax.text(8.1, y_top + 0.3, "+", fontsize=12)
    ax.text(7.1, y_bot + 0.3, "+", fontsize=12)

    # 4. Decouplers
    d21_out = draw_block(5.5, 6, "$D_{21}$")
    d12_out = draw_block(5.5, 4, "$D_{12}$")

    # M1 -> D21
    draw_ortho_arrow(5.0, y_top, 5.5, 6.5, direction='v_h')
    # D21 -> Sum U2
    draw_ortho_arrow(d21_out[0], 6.5, 7.5, y_bot + 0.2, direction='h_v')
    ax.text(7.7, y_bot + 0.5, "+", fontsize=12)

    # M2 -> D12
    draw_ortho_arrow(5.3, y_bot, 5.5, 4.5, direction='v_h')
    # D12 -> Sum U1
    draw_ortho_arrow(d12_out[0], 4.5, 8.5, y_top - 0.2, direction='h_v')
    ax.text(8.7, y_top - 0.5, "+", fontsize=12)

    # 5. Process Blocks
    g11_out = draw_block(11, y_top - 0.5, "$G_{11}$")
    g22_out = draw_block(11, y_bot - 0.5, "$G_{22}$")
    
    draw_arrow(8.7, y_top, 11, y_top) 
    draw_arrow(7.7, y_bot, 11, y_bot) 

    # 6. Interaction Blocks
    g12_out = draw_block(11, 6, "$G_{12}$")
    g21_out = draw_block(11, 4, "$G_{21}$")

    draw_ortho_arrow(9.5, y_top, 11, 4.5, direction='v_h') # U1 -> G21
    draw_ortho_arrow(9.0, y_bot, 11, 6.5, direction='v_h') # U2 -> G12

    # 7. Output Sums
    sum_y_1 = draw_sum(14.5, y_top)
    sum_y_2 = draw_sum(14.5, y_bot)
    
    draw_arrow(g11_out[0], y_top, 14.3, y_top)
    draw_arrow(g22_out[0], y_bot, 14.3, y_bot)
    ax.text(14.1, y_top + 0.3, "+", fontsize=12)
    ax.text(14.1, y_bot + 0.3, "+", fontsize=12)

    draw_ortho_arrow(g12_out[0], 6.5, 14.5, y_top - 0.2, direction='h_v')
    ax.text(14.7, y_top - 0.5, "+", fontsize=12)
    ax.text(14.7, 7.2, "b", fontsize=12, color='darkred')

    draw_ortho_arrow(g21_out[0], 4.5, 14.5, y_bot + 0.2, direction='h_v')
    ax.text(14.7, y_bot + 0.5, "+", fontsize=12)
    ax.text(14.7, 3.8, "a", fontsize=12, color='darkred')

    # 8. Outputs (이름 변경: C1->MAP, C2->CO)
    draw_arrow(14.7, y_top, 17.5, y_top)
    ax.text(17, y_top + 0.3, "MAP", fontsize=14, fontweight='bold')
    
    draw_arrow(14.7, y_bot, 17.5, y_bot)
    ax.text(17, y_bot + 0.3, "CO", fontsize=14, fontweight='bold')

    # 9. Cross Feedback Loops
    # MAP -> R2
    draw_line(16.5, y_top, 16.5, 10.5)   
    draw_line(16.5, 10.5, 1, 10.5)       
    draw_line(1, 10.5, 1, 0.5)           
    draw_line(1, 0.5, 2, 0.5)            
    draw_arrow(2, 0.5, 2, y_bot - 0.2)   
    ax.text(2.3, y_bot - 0.5, "-", fontsize=14, fontweight='bold')

    # CO -> R1
    draw_line(16, y_bot, 16, 0.2)        
    draw_line(16, 0.2, 1.5, 0.2)         
    draw_line(1.5, 0.2, 1.5, 10.0)       
    draw_line(1.5, 10.0, 2, 10.0)        
    draw_arrow(2, 10.0, 2, y_top + 0.2)  
    ax.text(2.3, y_top + 0.5, "-", fontsize=14, fontweight='bold')

    # Dots
    ax.add_patch(patches.Circle((14.5, y_top), 0.15, color='#b22222', zorder=10)) 
    ax.add_patch(patches.Circle((14.5, y_bot), 0.15, color='#b22222', zorder=10))
    ax.add_patch(patches.Circle((5.0, y_top), 0.08, color='black'))
    ax.add_patch(patches.Circle((5.3, y_bot), 0.08, color='black'))
    ax.add_patch(patches.Circle((9.5, y_top), 0.08, color='black'))
    ax.add_patch(patches.Circle((9.0, y_bot), 0.08, color='black'))

    plt.tight_layout()
    return fig

fig = draw_final_adjusted_diagram()
plt.show()