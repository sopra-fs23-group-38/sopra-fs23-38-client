
import { List, Avatar } from 'antd';

const CommentListItem = ({ item, actions }) => {
    console.log('Rendering item with ID: ', item);
    return (
        <List>
            <List.Item key={item.id} actions={actions}>
                <List.Item.Meta
                    avatar={<Avatar 
                        size={54}
                        src={`https://api.dicebear.com/6.x/adventurer/svg?seed=${item.author_avatar}&scale=90`} />}
                        title={<span style={{ fontWeight: 'bold', color: 'darkred', fontSize: '16px' }}>{item.author}</span>}
                        description={<span style={{ fontWeight: 'bold',color: 'black', fontSize: '14px',wordWrap: 'break-word',wordBreak: 'break-all' }}>{item.content}</span>}
                />
            </List.Item>
        </List>
    );
}










export default CommentListItem




    
