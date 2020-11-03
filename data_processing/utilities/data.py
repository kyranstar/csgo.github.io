import numpy as np 
import pandas as pd 
import matplotlib.pyplot as plt
import seaborn as sns
import math
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import DBSCAN

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

def cluster_positions(firefight_df, eps_map={'DMG_ATT': 0.004, 'DMG_VIC': 0.003, 'Smoke': 0.0045, 'Flash': 0.005, 'HE': 0.004, 'Incendiary': 0.008, 'Molotov': 0.008}, verbose=False):
    """
    Clusters the dataframe spatially into common positions. 
    
    Input:
        cluster_df: result of DataLoader.load_firefight_df, with columns ['file_round', 'seconds', 'pos_x', 'pos_y', 'hp_dmg']
        eps_map: the eps to use for DBSCAN for each pos_type
    Output:
        the input cluster_df, with new columns ['pos_cluster']
    """
    min_max_scaler = MinMaxScaler()
    cluster_df = firefight_df.copy()
    cluster_df[["pos_x", "pos_y"]] = min_max_scaler.fit_transform(cluster_df[["pos_x", "pos_y"]])
    cluster_df['pos_cluster'] = None

    for pos_type in np.unique(cluster_df['pos_type']):
        for team in cluster_df['att_side'].unique():
            print(pos_type, team)
            mask = (cluster_df['pos_type'] == pos_type) & (cluster_df['att_side'] == team)
            group = cluster_df[mask]
            # https://medium.com/@tarammullin/dbscan-parameter-estimation-ff8330e3a3bd
            cluster_model = DBSCAN(eps=eps_map[pos_type], min_samples=4)
            #cluster_model = DBSCAN(eps=0.05, min_samples=min_samples)
            pts = pd.concat([group['pos_x'], group['pos_y']], axis=1)
            cluster_model.fit(pts)
            firefight_df.loc[mask, 'pos_cluster'] = cluster_model.labels_
            if verbose:
                print(f"{team}, {pos_type}: {np.unique(cluster_model.labels_, return_counts=True)}")
    return firefight_df

def cluster_firefights(firefight_df, eps=0.08, n_samples=6, n_seconds_equiv_to_quarter_map=20, verbose=False):
    """
    Clusters the dataframe spatio-temporally into "firefights" - groups of points within a round that
    are within a similar space and time. Also calculates the net damage taken by either team within each 
    firefight.
    
    Input:
        cluster_df: result of DataLoader.load_firefight_df, with columns ['file_round', 'seconds', 'pos_x', 'pos_y', 'hp_dmg']
        eps: the eps to use for DBSCAN
        n_samples: the n_samples to use for DBSCAN
        n_seconds_equiv_to_quarter_map: The number of seconds considered equivalent to a quarter of the map when clustering.
    Output:
        the input cluster_df, with new columns ['firefight_cluster', 'firefight_net_t_dmg', ''firefight_net_ct_dmg']
    """
    max_round_length = firefight_df['seconds'].max()
    min_max_scaler = MinMaxScaler()
    cluster_df = firefight_df.copy()
    cluster_df[["seconds", "pos_x", "pos_y"]] = min_max_scaler.fit_transform(cluster_df[["seconds", "pos_x", "pos_y"]])
    # scale time so that 20 seconds is roughly equivalent to one quarter of the map
    cluster_df['seconds'] *= (max_round_length/n_seconds_equiv_to_quarter_map) * (1/4)
    # cluster firefights spatio-temporally
    cluster_df['firefight_cluster'] = None
    cluster_df['firefight_net_t_dmg'] = None
    cluster_df['firefight_net_ct_dmg'] = None
    for name, group in cluster_df.groupby('file_round'):
        # https://medium.com/@tarammullin/dbscan-parameter-estimation-ff8330e3a3bd
        cluster_model = DBSCAN(eps=0.08, min_samples=6)
        pts = pd.concat([group['seconds'], group['pos_x'], group['pos_y']], axis=1)
        cluster_model.fit(pts)
        firefight_df.loc[(firefight_df['file_round'] == name), 'firefight_cluster'] = cluster_model.labels_
        if verbose:
            print(f"{name}: {np.unique(cluster_model.labels_)}")
    # Find net damage for each firefight
    for name, group in cluster_df.groupby(['file_round', 'firefight_cluster']):
        ct_att_pts = group[(group['pos_type'] == 'DMG_VIC') & (group['att_side'] == 'CounterTerrorist')]
        t_att_pts = group[(group['pos_type'] == 'DMG_VIC') & (group['att_side'] == 'Terrorist')]
        t_net_dmg = np.sum(t_att_pts['hp_dmg'])
        ct_net_dmg = np.sum(ct_att_pts['hp_dmg'])
        mask = (firefight_df['file_round'] == name[0]) & (firefight_df['firefight_cluster'] == name[1])
        firefight_df.loc[mask, 'firefight_net_t_dmg'] = t_net_dmg
        firefight_df.loc[mask, 'firefight_net_ct_dmg'] = ct_net_dmg
        if verbose:
            print(f"{name}: t_dmg={t_net_dmg}, ct_dmg={ct_net_dmg}")
    return firefight_df


    

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
    
    def load_dmg_df(self, nrows=None, scale_to_map=True, dropna=True):
        dmg_df = pd.read_csv('../data/esea_master_dmg_demos.part1.csv', nrows=nrows)
        if self.use_data_pt2:
            dmg_df = grenade_df.append(pd.read_csv('../data/esea_master_kills_demos.part2.csv'))
        dmg_df = dmg_df[['file', 'round', 'seconds', 'att_side', 'vic_side', 'is_bomb_planted', 'bomb_site', 'hp_dmg', 'arm_dmg', 'hitbox', 'wp', 'wp_type', 'att_id', 'vic_id', 'att_pos_x', 'att_pos_y', 'vic_pos_x', 'vic_pos_y']]
        meta_df = self.load_meta_df()
        dmg_df = pd.merge(dmg_df, meta_df, how='left', left_on=['file','round'], right_on = ['file','round'])
        dmg_df['seconds'] -= dmg_df['start_seconds']
        dmg_df = dmg_df.drop(columns=['start_seconds'])

        if scale_to_map:
            map_df = self.load_map_df()
            for map_info in map_df.iterrows():
                map_name = map_info[0]
                map_data = map_info[1]
                mask = (dmg_df['map'] == map_name)
                map_df = dmg_df[mask]
                dmg_df.loc[mask, 'att_pos_y'] = map_df['att_pos_y'].apply(pointy_to_resolutiony, args=(map_data['StartY'], map_data['EndY'], map_data['ResY']))
                dmg_df.loc[mask, 'att_pos_x'] = map_df['att_pos_x'].apply(pointx_to_resolutionx, args=(map_data['StartX'], map_data['EndX'], map_data['ResX']))
                dmg_df.loc[mask, 'vic_pos_y'] = map_df['vic_pos_y'].apply(pointy_to_resolutiony, args=(map_data['StartY'], map_data['EndY'], map_data['ResY']))
                dmg_df.loc[mask, 'vic_pos_x'] = map_df['vic_pos_x'].apply(pointx_to_resolutionx, args=(map_data['StartX'], map_data['EndX'], map_data['ResX']))
        if dropna:
            dmg_df = dmg_df.dropna()
        return dmg_df
    
    def load_kill_df(self, nrows=None):
        kill_df = pd.read_csv('../data/esea_master_dmg_demos.part1.csv', nrows=nrows)
        if self.use_data_pt2:
            kill_df = grenade_df.append(pd.read_csv('../data/esea_master_kills_demos.part2.csv'))
        kill_df = kill_df[['file', 'round', 'seconds', 'att_side', 'vic_side', 'is_bomb_planted', 'wp', 'wp_type']]
        meta_df = self.load_meta_df()
        kill_df = pd.merge(kill_df, meta_df, how='left', left_on=['file','round'], right_on = ['file','round'])
        kill_df['seconds'] -= kill_df['start_seconds']
        kill_df = kill_df.drop(columns=['start_seconds'])
        return kill_df
    
    def load_grenade_df(self, nrows=None, scale_to_map=True, remove_decoy=True):
        grenade_df = pd.read_csv('../data/esea_master_grenades_demos.part1.csv', nrows=nrows)
        if self.use_data_pt2:
            grenade_df = grenade_df.append(pd.read_csv('../data/esea_master_grenades_demos.part2.csv'))
        grenade_df = grenade_df[['file', 'round', 'seconds', 'att_side', 'vic_side', 'is_bomb_planted', 'bomb_site', 'nade', 'nade_land_x', 'nade_land_y', 'att_pos_x', 'att_pos_y']]
        meta_df = self.load_meta_df()
        grenade_df = pd.merge(grenade_df, meta_df, how='left', left_on=['file','round'], right_on = ['file','round'])
        grenade_df['seconds'] -= grenade_df['start_seconds']
        grenade_df = grenade_df.drop(columns=['start_seconds'])

        #grenade_df["file_round"] = t_mirage_nade_df["file"] + t_mirage_nade_df["round"].astype(str)
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
        if remove_decoy:
            grenade_df = grenade_df[grenade_df['nade'] != 'Decoy']
        return grenade_df
    
    def load_firefight_df(self, nrows=None):
        """
        """
        grenade_df = self.load_grenade_df(nrows=None if nrows is None else nrows/2)
        dmg_df = self.load_dmg_df(nrows=None if nrows is None else nrows/2)
        cluster = []
        for i, row in grenade_df.iterrows():
            new_row_cols = ['winner_side', 'att_side', 'map', 'seconds', 'nade_land_x', 'nade_land_y']
            new_row = [row[x] for x in new_row_cols]
            new_row.append(0)
            new_row.extend([row['nade'], i, f"{row['file']}_{row['round']}"])
            cluster.append(new_row)

        for i, row in dmg_df.iterrows():
            new_row_cols = ['winner_side', 'att_side', 'map', 'seconds', 'att_pos_x', 'att_pos_y', 'hp_dmg']
            new_row = [row[x] for x in new_row_cols]
            new_row.extend(['DMG_ATT', i, f"{row['file']}_{row['round']}"])
            cluster.append(new_row)
            new_row_cols = ['winner_side', 'att_side', 'map', 'seconds', 'vic_pos_x', 'vic_pos_y', 'hp_dmg']
            new_row = [row[x] for x in new_row_cols]
            new_row.extend(['DMG_VIC', i, f"{row['file']}_{row['round']}"])
            cluster.append(new_row)

        cluster_df = pd.DataFrame(cluster, columns=['winner_side', 'att_side', 'map', 'seconds', 'pos_x', 'pos_y', 'hp_dmg', 'pos_type', 'index', 'file_round'])
        print(cluster_df.info())
        cluster_df = cluster_df[cluster_df['att_side'] != 'None']
        print(cluster_df.isna().sum())
        print(cluster_df['att_side'].unique())
        return cluster_df
  