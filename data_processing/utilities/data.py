import numpy as np 
import pandas as pd 
import matplotlib.pyplot as plt
import seaborn as sns
import math

#Convert map coordinates to image coordinates, from Bill Freeman's analysis
def pointx_to_resolutionx(xinput,startX=-3217,endX=1912,resX=1024):
    sizeX = endX - startX
    if startX < 0:
        xinput += startX * (-1.0)
    else:
        xinput += startX
    xoutput = float((xinput / abs(sizeX)) * resX);
    return xoutput

def pointy_to_resolutiony(yinput,startY=-3401,endY=1682,resY=1024):
    sizeY=endY-startY
    if startY < 0:
        yinput += startY *(-1.0)
    else:
        yinput += startY
    youtput = float((yinput / abs(sizeY)) * resY);
    return resY-youtput

class Clusterer:
    def __init__(self):
        pass
    

class DataLoader:
    def __init__(self, use_data_pt2=False):
        self.use_data_pt2 = use_data_pt2
        
    def load_map_df(self):
        map_df = pd.read_csv('../data/map_data.csv')
        map_df = map_df.rename( columns={'Unnamed: 0':'map_name'}).set_index('map_name')
        return map_df
    
    def load_meta_df(self):
        meta_df = pd.read_csv('../data/esea_meta_demos.part1.csv')
        if self.use_data_pt2:
            meta_df = meta_df.append(pd.read_csv('../data/esea_meta_demos.part2.csv'))
        meta_df = meta_df[['file', 'map', 'round', 'start_seconds', 'winner_side', 'round_type', 'ct_eq_val', 't_eq_val']]
        return meta_df
    
    def load_dmg_df(self, scale_to_map=True):
        dmg_df = pd.read_csv('data/esea_master_dmg_demos.part1.csv')
        if self.use_data_pt2:
            dmg_df = grenade_df.append(pd.read_csv('../data/esea_master_kills_demos.part2.csv'))
        dmg_df = dmg_df[['file', 'round', 'seconds', 'att_side', 'vic_side', 'is_bomb_planted', 'bomb_site', 'hp_dmg', 'arm_dmg', 'hitbox', 'wp', 'wp_type', 'att_id', 'vic_id', 'att_pos_x', 'att_pos_y', 'vic_pos_x', 'vic_pos_y']]
        meta_df = self.load_meta_df()
        dmg_df = pd.merge(dmg_df, meta_df, how='left', left_on=['file','round'], right_on = ['file','round'])
        dmg_df['seconds'] -= dmg_df['start_seconds']
        dmg_df = dmg_df.drop(columns=['start_seconds'])
        dmg_df.set_index(['file', 'round'], inplace=True)
        if scale_to_map:
            map_df = self.load_map_df()
            for map_info in map_df.iterrows():
                map_name = map_info[0]
                map_data = map_info[1]
                mask = (dmg_df['map'] == map_name)
                map_df = dmg_df[mask]
                dmg_df.loc[mask, 'att_pos_y'] = map_df['att_pos_y'].apply(pointy_to_resolutiony, args=(map_data['StartY'], map_data['EndY'], map_data['ResY']))
                dmg_df.loc[mask, 'att_pos_x'] = map_df['att_pos_x'].apply(pointx_to_resolutionx, args=(map_data['StartX'], map_data['EndX'], map_data['ResX']))
                dmg_df.loc[mask, 'nade_land_y'] = map_df['nade_land_y'].apply(pointy_to_resolutiony, args=(map_data['StartY'], map_data['EndY'], map_data['ResY']))
                dmg_df.loc[mask, 'nade_land_x'] = map_df['nade_land_x'].apply(pointx_to_resolutionx, args=(map_data['StartX'], map_data['EndX'], map_data['ResX']))
        return dmg_df
    
    def load_kill_df(self):
        kill_df = pd.read_csv('../data/esea_master_d,g_demos.part1.csv')
        if self.use_data_pt2:
            kill_df = grenade_df.append(pd.read_csv('../data/esea_master_kills_demos.part2.csv'))
        kill_df = kill_df[['file', 'round', 'seconds', 'att_side', 'vic_side', 'is_bomb_planted', 'wp', 'wp_type', 'ct_alive', 't_alive']]
        meta_df = self.load_meta_df()
        kill_df = pd.merge(kill_df, meta_df, how='left', left_on=['file','round'], right_on = ['file','round'])
        kill_df['seconds'] -= kill_df['start_seconds']
        kill_df = kill_df.drop(columns=['start_seconds'])
        kill_df.set_index(['file', 'round'], inplace=True)
        return kill_df
    
    def load_grenade_df(self, scale_to_map=True):
        grenade_df = pd.read_csv('../data/esea_master_grenades_demos.part1.csv')
        if self.use_data_pt2:
            grenade_df = grenade_df.append(pd.read_csv('../data/esea_master_grenades_demos.part2.csv'))
        grenade_df = grenade_df[['file', 'round', 'seconds', 'att_side', 'vic_side', 'is_bomb_planted', 'bomb_site', 'nade', 'nade_land_x', 'nade_land_y', 'att_pos_x', 'att_pos_y']]
        meta_df = self.load_meta_df()
        grenade_df = pd.merge(grenade_df, meta_df, how='left', left_on=['file','round'], right_on = ['file','round'])
        grenade_df['seconds'] -= grenade_df['start_seconds']
        grenade_df = grenade_df.drop(columns=['start_seconds'])

        grenade_df.set_index(['file', 'round'], inplace=True)
        if scale_to_map:
            map_df = self.load_map_df()
            for map_info in map_df.iterrows():
                map_name = map_info[0]
                map_data = map_info[1]
                mask = (grenade_df['map'] == map_name)
                map_df = grenade_df[mask]
                grenade_df.loc[mask, 'att_pos_y'] = map_df['att_pos_y'].apply(pointy_to_resolutiony, args=(map_data['StartY'], map_data['EndY'], map_data['ResY']))
                grenade_df.loc[mask, 'att_pos_x'] = map_df['att_pos_x'].apply(pointx_to_resolutionx, args=(map_data['StartX'], map_data['EndX'], map_data['ResX']))
                grenade_df.loc[mask, 'nade_land_y'] = map_df['nade_land_y'].apply(pointy_to_resolutiony, args=(map_data['StartY'], map_data['EndY'], map_data['ResY']))
                grenade_df.loc[mask, 'nade_land_x'] = map_df['nade_land_x'].apply(pointx_to_resolutionx, args=(map_data['StartX'], map_data['EndX'], map_data['ResX']))
        return grenade_df
  