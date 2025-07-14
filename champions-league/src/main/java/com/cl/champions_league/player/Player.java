package com.cl.champions_league.player;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "player_statistic3")
public class Player {

    @Id
    @Column(name = "player_name", unique = true)
    private String name;

    @Column(name = "nation")
    private String nation;

    @Column(name = "position")
    private String pos;

    @Column(name = "age")
    private Double age;

    @Column(name = "matches_played")
    private Integer mp;

    @Column(name = "starts")
    private Integer starts;

    @Column(name = "minutes_played")
    private Double min;

    @Column(name = "goals")
    private Double gls;

    @Column(name = "assists")
    private Double ast;

    @Column(name = "penalty_kick")
    private Double pk;

    @Column(name = "yellow_cards")
    private Double crdY;

    @Column(name = "red_cards")
    private Double crdR;

    @Column(name = "xG")
    private Double xG;

    @Column(name = "xAG")
    private Double xAG;

    @Column(name = "team_name")
    private String teamName;

    public Player() {}

    public Player(String name, String nation, String pos, Double age, Integer mp, Integer starts, Double min,
                  Double gls, Double ast, Double pk, Double crdY, Double crdR, Double xG, Double xAG, String teamName) {
        this.name = name;
        this.nation = nation;
        this.pos = pos;
        this.age = age;
        this.mp = mp;
        this.starts = starts;
        this.min = min;
        this.gls = gls;
        this.ast = ast;
        this.pk = pk;
        this.crdY = crdY;
        this.crdR = crdR;
        this.xG = xG;
        this.xAG = xAG;
        this.teamName = teamName;
    }

    // Getters and Setters

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNation() {
        return nation;
    }

    public void setNation(String nation) {
        this.nation = nation;
    }

    public String getPos() {
        return pos;
    }

    public void setPos(String pos) {
        this.pos = pos;
    }

    public Double getAge() {
        return age;
    }

    public void setAge(Double age) {
        this.age = age;
    }

    public Integer getMp() {
        return mp;
    }

    public void setMp(Integer mp) {
        this.mp = mp;
    }

    public Integer getStarts() {
        return starts;
    }

    public void setStarts(Integer starts) {
        this.starts = starts;
    }

    public Double getMin() {
        return min;
    }

    public void setMin(Double min) {
        this.min = min;
    }

    public Double getGls() {
        return gls;
    }

    public void setGls(Double gls) {
        this.gls = gls;
    }

    public Double getAst() {
        return ast;
    }

    public void setAst(Double ast) {
        this.ast = ast;
    }

    public Double getPk() {
        return pk;
    }

    public void setPk(Double pk) {
        this.pk = pk;
    }

    public Double getCrdY() {
        return crdY;
    }

    public void setCrdY(Double crdY) {
        this.crdY = crdY;
    }

    public Double getCrdR() {
        return crdR;
    }

    public void setCrdR(Double crdR) {
        this.crdR = crdR;
    }

    public Double getxG() {
        return xG;
    }

    public void setxG(Double xG) {
        this.xG = xG;
    }

    public Double getxAG() {
        return xAG;
    }

    public void setxAG(Double xAG) {
        this.xAG = xAG;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }
}