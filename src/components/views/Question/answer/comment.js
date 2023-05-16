
import { List, Avatar } from 'antd';

const CommentListItem = ({ item, actions }) => {
    console.log('Rendering item with ID: ', item.id);
    return (
        <List>
            <List.Item key={item.id} actions={actions}>
                <List.Item.Meta
                    avatar={<Avatar src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${item.id}`} />}
                    title={item.author}
                    description={item.content}
                />
            </List.Item>
        </List>
    );
}









export default CommentListItem




    
