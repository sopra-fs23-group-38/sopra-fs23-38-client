import Header from "components/ui/Header";
import Footer from "components/ui/Footer";
import {Layout} from "antd";

const ILayout = ({ children }) => {
  return (
    <Layout>
      <Layout.Header style={{ padding: 0 }}>
        <Header/>
      </Layout.Header>
      <Layout.Content>
        {children}
      </Layout.Content>
      <Layout.Footer style={{ padding: 0 }}>
        <Footer/>
      </Layout.Footer>
    </Layout>
  );
};

export default ILayout;

